'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AdminPage from '@/components/admin/AdminPage/AdminPage';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Spinner, { Loader } from '@/components/ui/Spinner/Spinner';
import { useToast } from '@/hooks/useToast';
import { useSubjects } from '@/hooks/useClassSections';
import { portalApi } from '@/lib/adminApi';
import styles from './MarksGrid.module.css';

const NEW_EXAM = '__new__';

/**
 * Marks entry for a whole class at once: pick the class and examination, list
 * the subjects with their maximum marks, then type each student's marks into
 * the grid. One save writes every cell; a cleared cell removes that result.
 *
 * Shared by the admin panel (any class) and the teacher portal (assigned
 * classes only) — the API enforces the scope, this only shows the list.
 *
 * @param {'admin'|'teacher'} portal
 * @param {{value: string, label: string}[]} classOptions
 */
export default function MarksGrid({ portal, classOptions }) {
  const api = portalApi(portal);
  const toast = useToast();
  const subjectOptions = useSubjects(portal);

  const [classGroup, setClassGroup] = useState('');
  const [examChoice, setExamChoice] = useState('');
  const [newExam, setNewExam] = useState('');
  const [grid, setGrid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Working copy of what will be saved.
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [resultDate, setResultDate] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [addSubject, setAddSubject] = useState('');
  const requestId = useRef(0);

  const exam = examChoice === NEW_EXAM ? newExam.trim() : examChoice;

  // Load the class (its students and exams) and, once an exam is chosen, the
  // marks already saved for it.
  useEffect(() => {
    if (!classGroup) {
      setGrid(null);
      return;
    }
    const id = (requestId.current += 1);
    setLoading(true);
    setError('');
    const query = examChoice && examChoice !== NEW_EXAM ? `&exam=${encodeURIComponent(examChoice)}` : '';
    api
      .get(`/${portal}/results/grid?classGroup=${encodeURIComponent(classGroup)}${query}`)
      .then((data) => {
        if (id !== requestId.current) return;
        setGrid(data);
        if (examChoice && examChoice !== NEW_EXAM) {
          setSubjects(data.subjects);
          setMarks(data.entries);
          setResultDate(data.resultDate ? String(data.resultDate).slice(0, 10) : '');
          setIsPublished(data.isPublished);
        }
      })
      .catch((err) => id === requestId.current && setError(err.message))
      .finally(() => id === requestId.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classGroup, examChoice, portal]);

  const chooseClass = (value) => {
    setClassGroup(value);
    setExamChoice('');
    setNewExam('');
    resetSheet();
  };

  const chooseExam = (value) => {
    setExamChoice(value);
    if (value === NEW_EXAM || !value) resetSheet();
  };

  const resetSheet = () => {
    setSubjects([]);
    setMarks({});
    setResultDate('');
    setIsPublished(false);
  };

  const addSubjectRow = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`${trimmed} is already in the list`);
      return;
    }
    setSubjects((current) => [...current, { name: trimmed, maxMarks: 100 }]);
    setAddSubject('');
  };

  const removeSubjectRow = (name) => setSubjects((current) => current.filter((s) => s.name !== name));

  const setMax = (name, value) =>
    setSubjects((current) => current.map((s) => (s.name === name ? { ...s, maxMarks: value } : s)));

  const setCell = (studentId, subject, value) =>
    setMarks((current) => ({ ...current, [studentId]: { ...(current[studentId] ?? {}), [subject]: value } }));

  const cellValue = (studentId, subject) => {
    const value = marks[studentId]?.[subject];
    return value === null || value === undefined ? '' : value;
  };

  const save = async (publish) => {
    if (!exam) return toast.error('Name the examination first');
    if (subjects.length === 0) return toast.error('Add at least one subject');
    const badMax = subjects.find((s) => !(Number(s.maxMarks) > 0));
    if (badMax) return toast.error(`Enter the maximum marks for ${badMax.name}`);

    setSaving(true);
    try {
      const result = await api.post(`/${portal}/results/grid`, {
        classGroup,
        exam,
        resultDate: resultDate || null,
        isPublished: publish,
        subjects: subjects.map((s) => ({ name: s.name, maxMarks: Number(s.maxMarks) })),
        entries: grid.students.map((student) => ({
          studentId: student.id,
          marks: Object.fromEntries(
            subjects.map((s) => {
              const value = cellValue(student.id, s.name);
              return [s.name, value === '' ? null : Number(value)];
            })
          ),
        })),
      });
      setIsPublished(publish);
      toast.success(
        `${result.saved} ${result.saved === 1 ? 'result' : 'results'} ${publish ? 'published' : 'saved as draft'} for ${classGroup} · ${exam}`
      );
      // A new exam is now one of the class's exams — select it so a re-open loads it.
      if (examChoice === NEW_EXAM) setExamChoice(exam);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const students = grid?.students ?? [];
  const ready = Boolean(classGroup && exam && !loading);

  return (
    <AdminPage
      title="Enter marks"
      description="Choose a class and an examination, list the subjects with their maximum marks, then fill in every student's marks in one sheet. Save as a draft to come back later, or publish to release the results to parents."
      action={
        <Link href={`/${portal}/results`} className="btn btn-outline btn-sm">
          ← All results
        </Link>
      }
    >
      <section className={styles.panel}>
        <div className={styles.pickers}>
          <Select
            id="grid-class"
            label="Class"
            placeholder="Choose a class…"
            options={classOptions}
            value={classGroup}
            onChange={(e) => chooseClass(e.target.value)}
            required
          />
          <Select
            id="grid-exam"
            label="Examination"
            placeholder={classGroup ? 'Choose an examination…' : 'Pick the class first'}
            options={[
              ...(grid?.exams ?? []).map((name) => ({ value: name, label: name })),
              { value: NEW_EXAM, label: '+ New examination…' },
            ]}
            value={examChoice}
            onChange={(e) => chooseExam(e.target.value)}
            disabled={!classGroup}
            required
          />
          {examChoice === NEW_EXAM ? (
            <Input
              id="grid-new-exam"
              label="Examination name"
              placeholder="Half-yearly 2026"
              value={newExam}
              onChange={(e) => setNewExam(e.target.value)}
              required
            />
          ) : null}
          <Input
            id="grid-date"
            type="date"
            label="Result date"
            value={resultDate}
            onChange={(e) => setResultDate(e.target.value)}
            disabled={!classGroup || !examChoice}
          />
        </div>
      </section>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      {loading ? <Loader label="Loading class…" /> : null}

      {ready && students.length === 0 ? (
        <p className={styles.empty}>
          There are no students registered in {classGroup} yet, so there is nobody to enter marks for.
        </p>
      ) : null}

      {ready && students.length > 0 ? (
        <>
          <section className={styles.panel}>
            <h2 className={styles.heading}>Subjects &amp; maximum marks</h2>
            {subjects.length > 0 ? (
              <ul className={styles.subjects}>
                {subjects.map((subject) => (
                  <li key={subject.name} className={styles.subject}>
                    <span className={styles.subjectName}>{subject.name}</span>
                    <label className={styles.max}>
                      <span>out of</span>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={subject.maxMarks ?? ''}
                        onChange={(e) => setMax(subject.name, e.target.value)}
                        aria-label={`Maximum marks for ${subject.name}`}
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeSubjectRow(subject.name)}
                      aria-label={`Remove ${subject.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.hint}>No subjects yet — add the subjects this examination covers.</p>
            )}
            <div className={styles.addRow}>
              <Select
                id="grid-add-subject"
                placeholder="Add a subject…"
                options={subjectOptions.filter(
                  (option) => !subjects.some((s) => s.name.toLowerCase() === option.value.toLowerCase())
                )}
                value=""
                onChange={(e) => addSubjectRow(e.target.value)}
                aria-label="Add a subject from the list"
              />
              <Input
                id="grid-add-custom"
                placeholder="Or type another subject and press Enter"
                value={addSubject}
                onChange={(e) => setAddSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubjectRow(addSubject);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => addSubjectRow(addSubject)}
                disabled={!addSubject.trim()}
              >
                Add
              </button>
            </div>
          </section>

          {subjects.length > 0 ? (
            <div className={styles.sheetWrap}>
              <table className={styles.sheet}>
                <thead>
                  <tr>
                    <th className={styles.rollHead}>Roll</th>
                    <th className={styles.nameHead}>Student</th>
                    {subjects.map((subject) => (
                      <th key={subject.name}>
                        {subject.name}
                        <small>/ {subject.maxMarks || '—'}</small>
                      </th>
                    ))}
                    <th className={styles.totalHead}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const total = subjects.reduce((sum, s) => sum + (Number(cellValue(student.id, s.name)) || 0), 0);
                    const max = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
                    return (
                      <tr key={student.id}>
                        <td className={styles.roll}>{student.rollNumber ?? '—'}</td>
                        <td className={styles.name}>{student.name}</td>
                        {subjects.map((subject) => {
                          const value = cellValue(student.id, subject.name);
                          const over = value !== '' && Number(value) > Number(subject.maxMarks);
                          return (
                            <td key={subject.name}>
                              <input
                                type="number"
                                min="0"
                                max={subject.maxMarks || undefined}
                                step="0.5"
                                className={over ? styles.over : undefined}
                                value={value}
                                onChange={(e) => setCell(student.id, subject.name, e.target.value)}
                                aria-label={`${student.name} — ${subject.name}`}
                              />
                            </td>
                          );
                        })}
                        <td className={styles.total}>
                          {total} / {max}
                          {max > 0 ? <small>{Math.round((total / max) * 1000) / 10}%</small> : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className={styles.footer}>
            <p className={styles.status}>
              {isPublished
                ? 'These results are published — parents can see them. Saving again updates what they see.'
                : 'Draft — nothing is visible to parents until you publish.'}
            </p>
            <div className={styles.buttons}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => save(false)} disabled={saving}>
                {saving ? <Spinner size="xs" /> : null} Save as draft
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => save(true)} disabled={saving}>
                {saving ? <Spinner size="xs" /> : null} Save &amp; publish
              </button>
            </div>
          </div>
        </>
      ) : null}
    </AdminPage>
  );
}
