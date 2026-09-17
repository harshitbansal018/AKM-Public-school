'use client';

import { useRef, useState } from 'react';
import { apiPost, API_ENABLED } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Textarea from '@/components/ui/Textarea/Textarea';
import styles from './JobApplicationForm.module.css';

const OTHER = '__other';
const MAX_CV_MB = 5;
const CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  position: '',
  positionOther: '',
  subject: '',
  qualification: '',
  experience: '',
  currentSchool: '',
  address: '',
  notes: '',
  website: '', // honeypot — real people never fill this
};

/** Client-side checks. The API validates again server-side; this is just UX. */
function validate(values, cv) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your full name';

  const digits = values.phone.replace(/\D/g, '');
  if (!digits) errors.phone = 'Please enter a phone number';
  else if (digits.length < 10) errors.phone = 'Enter a valid 10-digit phone number';

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address';

  const position = values.position === OTHER ? values.positionOther : values.position;
  if (!position.trim()) errors.position = 'Tell us the position you are applying for';

  if (!values.qualification.trim()) errors.qualification = 'Enter your highest qualification';

  if (!cv) errors.resume = 'Please attach your CV (PDF or Word)';
  else if (!CV_TYPES.includes(cv.type)) errors.resume = 'The CV must be a PDF or Word document';
  else if (cv.size > MAX_CV_MB * 1024 * 1024) errors.resume = `The CV must be under ${MAX_CV_MB} MB`;

  return errors;
}

/**
 * Careers application form. All wording comes from Website content.
 *
 * @param {string[]} positions     open positions; "Other" is always offered so nobody is turned away
 * @param {string}   [privacyNote] line beside the submit button
 * @param {string}   successTitle  heading of the "received" panel
 * @param {string}   [successText] what happens next, shown under the reference number
 */
export default function JobApplicationForm({ positions = [], privacyNote, successTitle, successText }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [cv, setCv] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const chooseCv = (event) => {
    setCv(event.target.files?.[0] ?? null);
    setErrors((current) => ({ ...current, resume: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(values, cv);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    if (values.website) return; // bot caught by the honeypot

    if (!API_ENABLED) {
      toast.info('Online applications are not connected yet — please email the school office.');
      return;
    }

    const body = new FormData();
    body.append('name', values.name.trim());
    body.append('phone', values.phone.trim());
    body.append('email', values.email.trim());
    body.append('position', (values.position === OTHER ? values.positionOther : values.position).trim());
    body.append('subject', values.subject.trim());
    body.append('qualification', values.qualification.trim());
    body.append('experience', values.experience.trim());
    body.append('currentSchool', values.currentSchool.trim());
    body.append('address', values.address.trim());
    body.append('notes', values.notes.trim());
    body.append('resume', cv);

    setSubmitting(true);
    try {
      const result = await apiPost('/job-applications', body);
      setReference(result?.reference ?? '');
      setValues(EMPTY);
      setCv(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (error) {
      toast.error(error.message || 'Could not send your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className={styles.thanks} role="status">
        <span className={styles.thanksTag}>{successTitle}</span>
        <p className={styles.refLabel}>Your reference number</p>
        <p className={styles.ref}>{reference}</p>
        {successText ? <p>{successText}</p> : null}
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setReference('')}>
          Submit another application
        </button>
      </div>
    );
  }

  const positionOptions = [
    ...positions.map((title) => ({ value: title, label: title })),
    { value: OTHER, label: 'Other (please specify)' },
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.group}>
        <legend>About you</legend>
        <div className={styles.row}>
          <Input
            id="name"
            label="Full name"
            placeholder="e.g. Priya Sharma"
            value={values.name}
            onChange={update('name')}
            error={errors.name}
            autoComplete="name"
            required
          />
          <Input
            id="phone"
            type="tel"
            label="Phone number"
            placeholder="10-digit mobile number"
            value={values.phone}
            onChange={update('phone')}
            error={errors.phone}
            autoComplete="tel"
            required
          />
        </div>
        <div className={styles.row}>
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            id="address"
            label="City / town"
            placeholder="Where you live"
            value={values.address}
            onChange={update('address')}
            autoComplete="address-level2"
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>The position</legend>
        <div className={styles.row}>
          <Select
            id="position"
            label="Position applied for"
            placeholder="Choose a position…"
            options={positionOptions}
            value={values.position}
            onChange={update('position')}
            error={errors.position}
            required
          />
          {values.position === OTHER ? (
            <Input
              id="positionOther"
              label="Which position?"
              placeholder="e.g. Librarian"
              value={values.positionOther}
              onChange={update('positionOther')}
              error={errors.position}
              required
            />
          ) : (
            <Input
              id="subject"
              label="Subject (for teaching posts)"
              placeholder="e.g. Mathematics"
              value={values.subject}
              onChange={update('subject')}
            />
          )}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Education & experience</legend>
        <div className={styles.row}>
          <Input
            id="qualification"
            label="Highest qualification"
            placeholder="e.g. M.Sc. Mathematics, B.Ed."
            value={values.qualification}
            onChange={update('qualification')}
            error={errors.qualification}
            required
          />
          <Input
            id="experience"
            label="Teaching / work experience"
            placeholder="e.g. 4 years"
            value={values.experience}
            onChange={update('experience')}
          />
        </div>
        <Input
          id="currentSchool"
          label="Current or last school / employer"
          placeholder="Optional"
          value={values.currentSchool}
          onChange={update('currentSchool')}
        />
        <Textarea
          id="notes"
          label="Anything else you would like us to know"
          placeholder="A short note about yourself, subjects you can teach, notice period…"
          rows={4}
          value={values.notes}
          onChange={update('notes')}
        />
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Your CV</legend>
        <label className={styles.upload}>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={chooseCv}
            className={styles.fileInput}
          />
          <span className={styles.uploadText}>
            {cv ? (
              <>
                <b>{cv.name}</b>
                <small>{(cv.size / 1024 / 1024).toFixed(1)} MB · click to change</small>
              </>
            ) : (
              <>
                <b>Attach your CV</b>
                <small>PDF or Word, up to {MAX_CV_MB} MB</small>
              </>
            )}
          </span>
        </label>
        {errors.resume ? (
          <span className={styles.error} role="alert">
            {errors.resume}
          </span>
        ) : null}
      </fieldset>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={update('website')}
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Submit application'}
        </button>
        {privacyNote ? <p className={styles.privacy}>{privacyNote}</p> : null}
      </div>
    </form>
  );
}
