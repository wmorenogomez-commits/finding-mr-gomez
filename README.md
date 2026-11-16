# Finding Mr. Gomez — Classroom Edition

Educational RPG for ESOL students (WIDA levels 1–2).

## Scoring (unchanged)
- 18 challenges. First correct attempt ≈ 5.56 points; later correct attempts ≈ 4.44 points.
- Must answer correctly to advance. Score locks once correct.
- Final score = sum of earned points (out of 100).

## Progress Saving
- Progress (name, period, skin, attempts, scores, completed missions, submission ID) is saved automatically to the browser’s localStorage.
- On return, if the same name and period are entered, the student is offered the option to continue.
- Refreshing or closing the tab does not lose completed work.

## Google Sheets Submission
Reliable from GitHub Pages. Uses text/plain POST to avoid CORS preflight problems.

**Setup**
1. Create a Google Sheet named **Finding Mr Gomez Results**.
2. Add tabs **Period1** and **Period3**.
3. Header row for both tabs:
   ```
   Timestamp | SubmissionId | Name | Period | FinalScore | NurseScore | LibraryScore | CafeteriaScore | OfficeScore | CounselingScore | LoungeScore | TotalIncorrect | CompletionStatus | AnswersJSON
   ```
4. Extensions → Apps Script → paste `google-apps-script/Code.gs` → Save.
5. Deploy → New deployment → Web app  
   - Execute as: **Me**  
   - Who has access: **Anyone**
6. **Important**: After any code change, deploy a **New deployment** (or manage and create a new version). The old URL stops working if you only save the script.
7. Copy the Web App URL into `js/config.js` as `APPS_SCRIPT_URL`.
8. Keep the Sheet private (share only with teachers).

Duplicate submissions are blocked by SubmissionId. The victory screen confirms success or offers **Retry Save**.

## Deploy for Students (GitHub Pages)
1. Create a public GitHub repository.
2. Upload the contents of the `finding-mr-gomez` folder to the root.
3. Settings → Pages → Source: Deploy from a branch → main / root.
4. Students open `https://yourusername.github.io/reponame/`.

No installation required.

## Controls & Safety
- WASD or arrows to move.
- Click rooms to enter.
- N opens the Detective Notebook (only when no dialog is open).
- Escape does **not** close unanswered questions. Students can always continue.
- Spanish Help button on every question.
- Selected skin tone tints the character.

## Privacy
Results go only to your private Google Sheet. Students cannot view other students’ data.
