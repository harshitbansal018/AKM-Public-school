# AKM Public School Website

## Bug Resolution and CMS Implementation Report

**Prepared for:** AKM Public School  
**Document date:** 23 November 2026  
**Project:** Public Website, Admin CMS and Parent Portal

## Executive Summary

The issues reported in the shared QA bug sheet have been reviewed and addressed. Fourteen reported issues have been fully resolved, the Policies feature and CMS support have been implemented, and three content-related items have intentionally been kept editable through the Admin CMS as requested.

The teacher count, Managing Director message and class count are not calculated or overwritten from the database. The authorised administrator can update these values from the CMS whenever required.

## Detailed Resolution Status

### BUG-01 — Career form blocked by enquiry rate limit

**Status:** Resolved  
Separate rate limiters have been implemented for the Enquiry and Job Application forms. Each form now displays the correct rate-limit message.

### BUG-02 — Date sheet notice linked to an empty Downloads page

**Status:** Resolved  
The misleading instruction was corrected. Until an actual PDF is uploaded, the notice directs users to obtain the date sheet from the school office. When a PDF is uploaded through the CMS, the Download option will be displayed automatically.

### BUG-03 — Teacher count did not match the Faculty page

**Status:** CMS-managed  
The teacher count on the homepage is editable from the Homepage section of the Admin CMS. It is intentionally not calculated from database faculty records. The client can update the displayed number whenever required.

### BUG-04 — Managing Director message duplicated the Principal message

**Status:** CMS-managed  
Separate Principal and Managing Director profiles and message fields are supported in the CMS. The temporary Managing Director content has been retained as requested and can be replaced by the client later.

### BUG-05 — Placeholder contact details

**Status:** Resolved  
The school address, telephone numbers and email address have been corrected and remain editable through the Admin CMS.

### BUG-06 — Text and punctuation errors

**Status:** Resolved  
Reported wording, punctuation and formatting issues were corrected. A content repair migration was also included so the corrected content is applied consistently.

### BUG-07 — Tablet hamburger menu alignment

**Status:** Resolved  
The responsive header was corrected so the hamburger menu is properly aligned on tablet and smaller screen sizes.

### BUG-08 — Invalid Notice and Gallery URLs returned HTTP 200

**Status:** Resolved  
Invalid Notice and Gallery detail URLs now return a proper 404 response. The error page retains the website header and footer and is marked to prevent search-engine indexing.

### BUG-09 — Full-screen loader appeared on every page

**Status:** Resolved  
The repeated full-screen preloader was removed from the public website. Navigation now displays page content directly.

### BUG-10 — Policies navigation and policy tabs were incomplete

**Status:** Implemented  
Policies navigation and support for multiple policy tabs have been added. Policy pages and their content can be managed from the Admin CMS. Only active and published policies are shown publicly; the client may add and publish additional policies as required.

### BUG-11 — Incorrect login validation and session-expired message

**Status:** Resolved  
Email and password fields now display field-level validation. Invalid credentials show an appropriate “Incorrect email or password” message. “Session expired” is displayed only when an authenticated session has actually expired.

### BUG-12 — Invalid password-reset token still displayed the form

**Status:** Resolved  
Password-reset tokens are validated before the form is displayed. Invalid or expired links now show an appropriate message and an option to request a new reset link.

### BUG-13 — Password-reset hint text was clipped

**Status:** Resolved  
Input spacing, help text and responsive layout were corrected so the complete hint remains visible.

### BUG-14 — Mobile top bar occupied three rows

**Status:** Resolved  
The mobile top bar was redesigned into a compact responsive layout to reduce unnecessary vertical space.

### BUG-15 — Notice search field width did not match the list

**Status:** Resolved  
The search field and notice list now use matching width and alignment.

### BUG-16 — Form success message appeared outside the visible area

**Status:** Resolved  
After successful submission of an Enquiry or Job Application, the page automatically scrolls to and focuses on the success confirmation.

### BUG-17 — Privacy Policy did not list all collected information

**Status:** Resolved  
The Privacy Policy content was updated to cover the information collected through admission enquiries and job applications. Policy content remains editable from the Admin CMS.

### BUG-18 — Homepage displayed an incorrect class count

**Status:** CMS-managed  
The homepage class count is editable from the Homepage section of the Admin CMS. As requested, it is not hardcoded or calculated from database records. The administrator can set the public value to “15 Classes”.

## CMS Clarification

The following items are intentionally controlled by the client through the Admin CMS:

- Homepage teacher count
- Homepage class count
- Principal and Managing Director profiles and messages
- School contact information
- Notices and downloadable PDF files
- Policy pages and policy tabs

This allows the school to update public content without requiring a code change or developer deployment.

## Verification Completed

- API automated tests: **15 of 15 passed**
- Production build: **70 of 70 pages generated successfully**
- Database migrations: **Up to date**
- CMS settings mapping audit: **197 of 197 mappings verified**
- Invalid public resource handling and private homework access were also verified

## Final Status

The reported technical bugs have been resolved and the related website functionality is ready for production use. CMS-managed values must be reviewed and maintained by the authorised school administrator before or after publication, depending on the availability of final client content.

