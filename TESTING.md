# Testing Checklist

## Clients
- [x] Create a new client with a valid name.
- [x] Verify client code is automatically generated (e.g., First National Bank -> FNB001).
- [x] Verify numeric sequence increments for duplicate prefixes (e.g., FNB002).
- [x] Verify padding for short names (e.g., IT -> ITA001).
- [x] Verify empty state displays "No client(s) found." without table headings.
- [x] Verify clients are ordered by Name ascending.
- [x] Verify "No. of linked contacts" displays the correct integer.

## Contacts
- [x] Create a new contact with valid Name, Surname, and Email.
- [x] Verify invalid email formats are rejected (422 error from Pydantic).
- [x] Verify duplicate emails are rejected (Unique constraint).
- [x] Verify empty state displays "No contact(s) found." without table headings.
- [x] Verify contacts are ordered by Full Name (Surname, Name) ascending.
- [x] Verify "No. of linked clients" displays the correct integer.

## Linking / Unlinking
- [x] Link a contact to multiple clients.
- [x] Link multiple contacts to one client.
- [x] Unlink a contact from a client (and verify the contact still exists).
- [x] Unlink a client from a contact (and verify the client still exists).
- [x] Verify the confirmation prompt appears before unlinking.
- [x] Verify the empty state on the Client Contact(s) tab says "No contacts found."
- [x] Verify the empty state on the Contact Client(s) tab says "No contact(s) found."

## UI & Validation
- [x] Verify JavaScript validation catches empty fields before AJAX requests.
- [x] Verify tabs switch correctly on both forms.
- [x] Verify client code field is hidden/empty until saved, then displays the read-only code.
- [x] Verify success/error messages display correctly.