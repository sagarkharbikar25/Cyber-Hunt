-- =============================================
-- CyberHunt Level Seeding
-- Run AFTER schema.sql
-- Answer hashes will be set by organizer
-- =============================================

-- LEVEL 1: HTML Source
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  1,
  'The Hidden Comment',
  'html_source',
  '<div class="challenge-content">
    <h2>Mission Brief: Operation Silent Echo</h2>
    <p>An anonymous informant has hidden a critical piece of intel somewhere on the CyberHunt platform. The message was never meant to be seen by human eyes — it was written for machines.</p>
    <p>Begin at the CyberHunt landing page. The answer is hidden in plain sight — but only if you know where to look.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> The message is embedded in the page''s metadata layer, not in the visible content. Use your browser''s developer tools to investigate.
    </div>
  </div>',
  '198245ffa8cfb9b043e0221bcede1275375295011890e992da3f12c70b5e386c',
  'a0a1f44308bd7ef3ef73fad02dbc9600',
  'CY',
  'Every page has secrets. Not everything is meant to be displayed.',
  'Look beyond the rendered content. The truth is in the source.',
  'Try View Page Source (Ctrl+U). Search for "CY" in the HTML head section.'
);

-- LEVEL 2: URL Discovery
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  2,
  'The Dead End That Wasn''t',
  'url_discovery',
  '<div class="challenge-content">
    <h2>Mission Brief: The Vanishing Path</h2>
    <p>A website error page is not always what it seems. Sometimes, the page you were never meant to visit holds the key to the next step.</p>
    <p>Use the pattern from Level 1''s fragment to construct the hidden URL.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> A 404 page hides more than an error. Follow the breadcrumbs — even the ones that look broken.
    </div>
  </div>',
  '3b9a5d710324c45c909179c7c5ec138f44ab6a018626fefeb93c324218f1bfee',
  '2041fd79dc5d864a8a184e332dd10171',
  'BE',
  'Not all 404 pages are mistakes. Some are placed there on purpose.',
  'Look at the URL bar after the page loads. Did it change? Did it redirect?',
  'The answer is on the final destination page after all redirects complete.'
);

-- LEVEL 3: GitHub Investigation
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  3,
  'The Forgotten Commit',
  'github_investigation',
  '<div class="challenge-content">
    <h2>Mission Brief: Digital Archaeology</h2>
    <p>In the world of version control, nothing is ever truly deleted. Every commit, every message, every change is recorded forever.</p>
    <p>A developer working on the CyberHunt project left a message buried deep in the repository''s history. It''s not in the code. It''s not in the README.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Visit the @cyberhunt-techalfa GitHub repository. The answer lies in a commit from 2 weeks ago. You must read through the commit history — not just browse the files.
    </div>
  </div>',
  '0926d6ae7b93aa1ffc363db7f27a0dafa9eb91de864b9489f42410556040577a',
  '6ed4a5cf9203b844364e888797802d61',
  'RH',
  'The latest code is not always where the secrets are buried.',
  'Check the commit history, not the file browser. The answer is in a commit message.',
  'Look at commits from 2 weeks ago specifically. Sort by date.'
);

-- LEVEL 4: Logic Puzzle
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  4,
  'The Encrypted Log',
  'logic_puzzle',
  '<div class="challenge-content">
    <h2>Mission Brief: Pattern Recognition</h2>
    <p>We''ve intercepted an encrypted log file from a classified server. The file contains 6 lines of seemingly random data, but only specific lines hold the real message.</p>
    <pre class="log-file">
LOG-001: X9F2-K3M8-PATTERN-ALPHA
LOG-002: B7N1-Q4R6-SECTOR-DELTA
LOG-003: W2T5-Y8J3-CIPHER-BRAVO
LOG-004: M6H9-L1D4-VECTOR-ECHO
LOG-005: F3K7-G2N5-SIGNAL-FOXTROT
LOG-006: R8V4-C6A1-CHANNEL-GAMMA
    </pre>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Use the rule hidden in Level 3''s fragment to determine which lines to extract and how to decode them. Concatenate the decoded parts to form the answer.
    </div>
  </div>',
  'f3c257d05d65c94c9f9e519003e33586df6bcbaf7c0f93d9a33df349048a14b7',
  '15bf474faf51392e5fb22169bf4f5e58',
  'UN',
  'Not every line in the log matters. Some are decoys.',
  'The rule is hidden in the fragment you earned from Level 3.',
  'Even-numbered lines with a specific prefix. Check Level 3 fragment for the prefix.'
);

-- LEVEL 5: Coding Challenge (LinkedIn URL)
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  5,
  'The Broken Code',
  'coding_challenge',
  '<div class="challenge-content">
    <h2>Mission Brief: Code Forensics</h2>
    <p>Two programs were intercepted from a secure server. Both are broken — each has one deliberate error. Fix them both to reveal the hidden message.</p>
    <div class="code-section">
      <h3>Program A — Python</h3>
      <pre class="code-block python">
def greet(name)<span style="color:red;">  </span>  # something is missing
    print("Hello", name)

greet("Agent")
      </pre>
      <h3>Program B — JavaScript</h3>
      <pre class="code-block javascript">
const data = {
  mission: "find the key",
  agent: "classified"
  // something is missing

console.log(data.mission);
      </pre>
    </div>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Each program''s error output contains a hidden cipher_key. Fix the code, read the output, decode the cipher_key. Combine both decoded fragments to form a URL. Visit that URL to find the answer.
    </div>
  </div>',
  'f57f447ddc18fcf8c9ae1fa614646e7aad235b74dc4feb70486343e23ba250d5',
  '2061e36e35934543ad60163abaf9e8ed',
  'T_',
  'Both programs are broken. Fix them. But also — read every line of the output carefully.',
  'Error messages can carry more than just errors. Decode what you find in Program A''s output first.',
  'Two fragments, one URL. TechAlfa has a professional presence online. Combine A then B.'
);

-- LEVEL 6: ZIP Challenge
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  6,
  'The Vault Package',
  'zip_challenge',
  '<div class="challenge-content">
    <h2>Mission Brief: Package Intercept</h2>
    <p>A compressed file package has been intercepted during transmission. It contains multiple files, but only one holds the real intelligence.</p>
    <p>The package is password-protected. The password is derived from the fragments you''ve collected in Levels 1-4.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Download the ZIP file. The password is a combination of your collected fragments. Inside the ZIP, only one file is genuine — the others are decoys. Find the real file and extract the answer.
    </div>
  </div>',
  'dca9c69cc9f9f5adf69dc7ecead4f5703ba8f99adb934c757341ed3e1ce277a7',
  '2b4b22ed002cbdcc9f4012b3f8287866',
  'HU',
  'You need fragments from earlier levels. Collect them first.',
  'Combine fragments from Levels 1-4 in a specific order to form the password.',
  'The ZIP contains 3 text files and 1 image. Only one file contains the real answer.'
);

-- LEVEL 7: EXIF / Base64
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  7,
  'The Hidden Metadata',
  'exif_base64',
  '<div class="challenge-content">
    <h2>Mission Brief: Digital Forensics</h2>
    <p>This image appears to be a standard CYBER HUNT classified document. But appearances can be deceiving.</p>
    <p>Every digital photograph carries invisible information — metadata that most people never see. The answer is hidden within this very image.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> The image on this page contains hidden data in its EXIF metadata. You need to extract and decode this data to find the answer.
    </div>
  </div>',
  '9d33355fffa3946dbccf59ab7d2db1a5cd45b26854aa8be5ae55e639345c2dd7',
  'c96d11e5cffbaabd3289cc3254f37923',
  'NT',
  'Every photo remembers more than you see.',
  'Metadata is data about data. Images have it too.',
  'Try EXIF. Comment field. Then decode what you find. Base64 → ROT13.'
);

-- LEVEL 8: DB Investigation
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  8,
  'The Leaked Database',
  'db_investigation',
  '<div class="challenge-content">
    <h2>Mission Brief: Data Breach Analysis</h2>
    <p>We''ve intercepted what appears to be a leaked database dump. The data contains 10 records with various fields, but one record stands out — it contains a hash that doesn''t match any known encryption standard used by the group.</p>
    <pre class="db-dump">
{"id":1,"name":"viper","status":"active","key":"a1b2c3d4e5"}
{"id":2,"name":"shadow","status":"inactive","key":"f6g7h8i9j0"}
{"id":3,"name":"phantom","status":"active","key":"k1l2m3n4o5"}
{"id":4,"name":"cipher","status":"flagged","key":"2d4f6a8c1e"}
{"id":5,"name":"wraith","status":"active","key":"p6q7r8s9t0"}
{"id":6,"name":"spectre","status":"inactive","key":"u1v2w3x4y5"}
{"id":7,"name":"oracle","status":"active","key":"z6a7b8c9d0"}
{"id":8,"name":"nexus","status":"flagged","key":"e1f2g3h4i5"}
{"id":9,"name":"apex","status":"active","key":"j6k7l8m9n0"}
{"id":10,"name":"zero","status":"active","key":"o1p2q3r4s5"}
    </pre>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Cross-reference the key field values with the provided rainbow table below. Find which record''s key is an MD5 hash of a common word. That word is the answer.
    </div>
  </div>',
  'a43d979096c19fd081092374d635f1ebc8b3bf355c022b2bfc9f974a450fa2a9',
  '8f52752b0d9f9e553373239150d01629',
  'ER',
  'Not all records are equal. One stands out from the rest.',
  'The "key" field looks random, but one of them is actually an MD5 hash.',
  'Use an MD5 lookup tool on each key value. One will match a common English word.'
);

-- LEVEL 9: Hidden JS Function
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  9,
  'The Silent Function',
  'hidden_function',
  '<div class="challenge-content">
    <h2>Mission Brief: Code Investigation</h2>
    <p>This page appears to be a static mission briefing. But appearances can be deceiving — not everything that exists in code is meant to be called automatically.</p>
    <p>Somewhere in this page''s JavaScript, a function waits to be discovered. It was never called. It was never linked to any button. It simply... exists.</p>
    <div class="challenge-instruction">
      <strong>Directive:</strong> Open your browser''s Developer Console (F12 → Console). Look for a function that was defined but never invoked. Run it to reveal the hidden message.
    </div>
  </div>',
  'ee51f6295531ce525790434f947197b4bb887113cf2c9df332cbf5d44261ae17',
  '473347b68ab77c7b35c31731f12c5e06',
  'S_',
  'Not every function is called automatically.',
  'Check the browser console for something that was defined but never executed.',
  'Look for a function called revealMission(). Type revealMission() in the console and press Enter.'
);

-- LEVEL 10: Final Boss (Fragment Assembly)
INSERT INTO levels (level_id, title, challenge_type, content_html, answer_hash, answer_salt, fragment, hint_1, hint_2, hint_3) VALUES (
  10,
  'The Final Decryption',
  'final_boss',
  '<div class="challenge-content">
    <h2>Mission Brief: Operation CYBERHUNT</h2>
    <p>You''ve collected all the fragments. Now it''s time to assemble the final key.</p>
    <p>On this page, your collected fragments are displayed below. A cipher key tells you how to rearrange them.</p>
    <div class="fragment-display" id="fragment-display">
      <!-- Fragments loaded dynamically from API -->
    </div>
    <div class="cipher-key">
      <h3>Decryption Protocol:</h3>
      <ul>
        <li>Order the fragments by their level number in REVERSE</li>
        <li>Concatenate all fragments in that order</li>
        <li>Remove any underscores (_)</li>
        <li>The result is your final answer</li>
      </ul>
    </div>
    <div class="challenge-instruction">
      <strong>Directive:</strong> This is the final mission. Submit the assembled answer to complete CYBERHUNT.
    </div>
  </div>',
  '654db4a6442afb02d22d17fa4db3ce07664acc47574834ba89e25f60905e7a85',
  '6aac257d350259e73da3a45cfb58422c',
  '',
  'You have all the fragments. Check your inventory.',
  'Reverse the level order: Level 10 first, Level 1 last.',
  'Assemble: fragment_10 + fragment_9 + ... + fragment_1. Remove underscores.'
);
