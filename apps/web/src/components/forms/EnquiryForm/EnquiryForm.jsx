'use client';

import { useState } from 'react';
import { apiPost, API_ENABLED } from '@/lib/api';
import { classGroups } from '@/constants/classGroups';
import { useToast } from '@/hooks/useToast';
import { toTelHref } from '@/lib/format';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Textarea from '@/components/ui/Textarea/Textarea';
import styles from './EnquiryForm.module.css';

const EMPTY = {
  parentName: '',
  phone: '',
  studentName: '',
  classGroup: '',
  message: '',
  website: '', // honeypot — real people never fill this
};

/** Client-side checks. The API validates again server-side; this is just UX. */
function validate(values) {
  const errors = {};

  if (!values.parentName.trim()) {
    errors.parentName = 'Please enter the parent name';
  }

  const digits = values.phone.replace(/\D/g, '');
  if (!digits) errors.phone = 'Please enter a phone number';
  else if (digits.length < 10) errors.phone = 'Enter a valid 10-digit phone number';

  if (!values.classGroup) errors.classGroup = 'Please choose a class';

  return errors;
}

/**
 * Admission enquiry form.
 *
 * Posts to the Express API when one is configured. Until the backend exists it
 * points the visitor at the phone and WhatsApp numbers rather than silently
 * dropping the message.
 */
export default function EnquiryForm({ settings }) {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    if (values.website) return; // bot caught by the honeypot

    if (!API_ENABLED) {
      toast.info('Online enquiries are not connected yet — please call or WhatsApp the school.');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/enquiries', {
        parentName: values.parentName.trim(),
        phone: values.phone.trim(),
        studentName: values.studentName.trim() || null,
        classGroup: values.classGroup,
        message: values.message.trim() || null,
      });
      setValues(EMPTY);
      setSent(true);
      toast.success('Thank you! The school will contact you shortly.');
    } catch (error) {
      toast.error(error.message || 'Could not send your enquiry. Please try calling the school.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.thanks}>
        <div className={styles.thanksIcon} aria-hidden="true">
          ✅
        </div>
        <h3>Enquiry received</h3>
        <p>
          Thank you for reaching out. Someone from the school office will call you on the number you
          provided, usually within one working day.
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSent(false)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <Input
          id="parentName"
          name="parentName"
          label="Parent&rsquo;s Name"
          placeholder="e.g. Rajesh Kumar"
          value={values.parentName}
          onChange={update('parentName')}
          error={errors.parentName}
          autoComplete="name"
          required
        />
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
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
          id="studentName"
          name="studentName"
          label="Student Name"
          placeholder="Optional"
          value={values.studentName}
          onChange={update('studentName')}
        />
        <Select
          id="classGroup"
          name="classGroup"
          label="Class Applying For"
          placeholder="Select a class"
          options={classGroups}
          value={values.classGroup}
          onChange={update('classGroup')}
          error={errors.classGroup}
          required
        />
      </div>

      <Textarea
        id="message"
        name="message"
        label="Your Message"
        placeholder="Anything you would like the school to know (optional)"
        value={values.message}
        onChange={update('message')}
      />

      {/* honeypot — hidden from people, irresistible to bots */}
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

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send Enquiry'}
      </button>

      <p className={styles.alt}>
        Prefer to talk? Call{' '}
        <a href={toTelHref(settings.phonePrimary)}>{settings.phonePrimary}</a>
        {' or '}
        <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer">
          message us on WhatsApp
        </a>
        .
      </p>
    </form>
  );
}
