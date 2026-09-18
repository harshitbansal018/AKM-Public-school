'use client';

import { useState } from 'react';
import ChildPage from '@/components/parent/ChildPage/ChildPage';
import ListToolbar from '@/components/admin/ListToolbar/ListToolbar';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { formatLongDate } from '@/lib/format';
import styles from './results.module.css';

/**
 * Report cards: one card per examination, a row per subject with marks out of
 * the maximum, and the total and percentage underneath. Only what the school
 * has published for this child is here.
 */
export default function ParentResultsPage() {
  return (
    <ChildPage title="Results" description="Marks released by the school, examination by examination.">
      {(detail) => <ReportCards cards={detail.reportCards ?? []} />}
    </ChildPage>
  );
}

function ReportCards({ cards }) {
  const [exam, setExam] = useState('');
  const filters = [
    {
      name: 'exam',
      label: 'Examination',
      placeholder: 'All examinations',
      options: cards.map((card) => ({ value: card.exam, label: card.exam })),
    },
  ];
  const visible = exam ? cards.filter((card) => card.exam === exam) : cards;

  if (cards.length === 0) {
    return <EmptyState title="No results released yet" description="Results appear here once the teacher publishes them." />;
  }

  return (
    <>
      {cards.length > 1 ? (
        <ListToolbar
          filters={filters}
          values={{ exam }}
          onFilter={(_name, value) => setExam(value)}
          summary={`${visible.length} of ${cards.length} examinations`}
        />
      ) : null}

      <div className={styles.cards}>
        {visible.map((card) => (
          <section key={card.exam} className={styles.card}>
            <header className={styles.head}>
              <div>
                <h2>{card.exam}</h2>
                {card.resultDate ? <p>Declared {formatLongDate(card.resultDate)}</p> : null}
              </div>
              {card.percentage !== null ? (
                <span className={styles.percent}>{card.percentage}%</span>
              ) : null}
            </header>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className={styles.num}>Marks</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {card.subjects.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.subject}>{row.subject}</td>
                    <td className={styles.num}>
                      <b>{row.marks !== null ? row.marks : row.score}</b>
                      {row.maxMarks !== null ? <span className={styles.max}> / {row.maxMarks}</span> : null}
                    </td>
                    <td className={styles.remarks}>{row.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
              {card.totalMax > 0 ? (
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className={styles.num}>
                      <b>{card.total}</b>
                      <span className={styles.max}> / {card.totalMax}</span>
                    </td>
                    <td className={styles.remarks}>{card.percentage}%</td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </section>
        ))}
      </div>
    </>
  );
}
