# 🎯 Operation Blackout: Master Event Design

**Theme:** Think like a detective, hack like an engineer.
**Goal:** Teams collect 9 cryptic "fragments" across 9 different cybersecurity challenges. In the 10th challenge, they must combine all fragments to form the master decryption key.

Here is the complete sequence of the event based on your brilliant ideas, incorporating the **platform loop**:

### 🧩 Level 1: The Initial Breach (GitHub Source)
* **The Challenge:** Participants are given a link to a public GitHub repository belonging to TechAlfa. 
* **The Solution:** They must manually search through the source code files to find the first fragment hidden in a basic code comment.

### 🕰️ Level 2: The Forgotten Commit (GitHub History)
* **The Challenge:** The current code has no more clues. The hint points them to the past.
* **The Solution:** Participants must check the Git commit history from the past 10 days to find a commit where a developer accidentally leaked the 2nd fragment before deleting it.

### 🔐 Level 3: The Dummy Portal (Vercel)
* **The Challenge:** The Level 2 fragment gives them a link to a dummy login page hosted on Vercel. The hint is *"Sometimes you are the solution."*
* **The Solution:** They must log in using their registered Email Address as the username, and their assigned **Team ID** as the password to retrieve the 3rd fragment.

### 🔍 Level 4: The Needle in a Haystack (Back to GitHub)
* **The Challenge:** The Level 3 success message loops them *back* to the original platform with the hint: *"Sometimes you forget to check the source code."*
* **The Solution:** They return to the GitHub repo, which now has a massive new directory containing 10 files with 2,000 lines of code each (20,000 lines total!). They must use text searching skills (`Ctrl+F` or `grep`) to find the 4th fragment buried deep inside the noise.

### 🛑 Level 5: The AI Trap (Back to Vercel)
* **The Challenge:** The hint sends them back to the Vercel dummy site. This puzzle is designed to defeat students relying purely on AI tools. 
* **The Solution:** They must open their browser's Developer Tools (F12) and check the **Console** tab on the website. A `console.error()` message will contain the 5th fragment.

### 🕵️‍♂️ Level 6: Open Source Intelligence (Instagram/Socials)
* **The Challenge:** The trail breaks away from code and onto social media.
* **The Solution:** Participants must hunt through TechAlfa's official Instagram or LinkedIn pages to find a specific post where the 6th fragment is cleverly hidden in an image or caption.

### 🗄️ Level 7: The Matryoshka Archive (TechAlfa Site)
* **The Challenge:** The social media post directs them to download a compressed file from the official TechAlfa website.
* **The Solution:** They must extract a nested ZIP file **4 times** (unzipping a zip within a zip) to finally reach the text document containing the 7th fragment.

### 💻 Level 8: The Engineer's Trial (Coding -> LinkedIn)
* **The Challenge:** Participants are presented with 4 small coding problems.
* **The Solution:** Solving each problem outputs a small piece of a URL. They arrange the 4 pieces into a valid TechAlfa LinkedIn URL, which contains the 8th fragment.

### 💥 Level 9: The Data Breach (Rainbow Tables)
* **The Challenge:** Participants download a text file containing a "leaked database" with usernames and **MD5 Password Hashes**.
* **The Solution:** They must copy the hash and use an online MD5 cracker (a rainbow table) to decrypt it into a readable word. The decrypted word is the 9th fragment.

### 👑 Level 10: The Final Decryption (The Boss Level)
* **The Challenge:** They have collected 9 single-letter fragments (e.g. `C`, `O`, `S`, `L`, `T`, `B`, `A`, `K`, `U`).
* **The Solution:** They must unscramble these 9 letters to spell the final Master Key. The correct anagram spells **`BLACKOUTS`**. Submitting this key completes Operation Blackout!
