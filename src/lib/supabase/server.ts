import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "";
}

function createRealClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createMockClient(): SupabaseClient {
  const MOCK_TEAM = {
    team_id: "TEAM-X7K92", team_name: "Byte Crushers", leader_name: "Agent Alpha",
    leader_email: "alpha@test.com", college_name: "Tech University", member_count: 2,
    members_json: [{ name: "Agent Alpha", email: "alpha@test.com" }, { name: "Agent Beta", email: "beta@test.com" }],
    registered_at: "2026-07-01T10:00:00Z", is_disqualified: false,
  };

  const MOCK_LEVELS = [
    { level_id: 1, title: "Operation Silent Echo", challenge_type: "html_source",
      content_html: '<div class="challenge-content"><h2>Mission Brief: The Unseen Layer</h2><p>Our informant left a calling card on this very system.</p><div class="challenge-instruction"><strong>Directive:</strong> Some things are transmitted but never rendered. Find the echo.</div></div>',
      answer_hash: "", answer_salt: "", fragment: "CY",
      hint_1: "Every page has secrets.", hint_2: "Look beyond the rendered content.", hint_3: "Try View Page Source (Ctrl+U).", is_active: true },
    { level_id: 2, title: "The Vanishing Path", challenge_type: "url_discovery",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Dead Ends</h2><p>An intercepted communication led to a dead drop that doesn\'t exist.</p><div class="challenge-instruction"><strong>Directive:</strong> Sometimes the journey tells you more than the destination.</div></div>',
      answer_hash: "", answer_salt: "", fragment: "BE",
      hint_1: "Not all 404 pages are mistakes.", hint_2: "Look at the URL bar after the page loads.", hint_3: "The answer is on the final destination page.", is_active: true },
    { level_id: 3, title: "Digital Archaeology", challenge_type: "github_investigation",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Shadows of the Past</h2><p>The operative tried to erase their tracks, but the internet remembers everything.</p><div class="challenge-instruction"><strong>Directive:</strong> Investigate the public facing archives of @cyberhunt-techalfa.</div></div>',
      answer_hash: "", answer_salt: "", fragment: "RH",
      hint_1: "The latest code is not always where secrets are.", hint_2: "Check the commit history.", hint_3: "Look at commits from 2 weeks ago.", is_active: true },
    { level_id: 4, title: "Pattern Recognition", challenge_type: "logic_puzzle",
      content_html: '<div class="challenge-content"><h2>Mission Brief: The Noise</h2><p>We intercepted an encrypted frequency.</p><pre class="log-file">LOG-001: X9F2-K3M8-PATTERN-ALPHA\nLOG-002: B7N1-Q4R6-SECTOR-DELTA\nLOG-003: W2T5-Y8J3-CIPHER-BRAVO\nLOG-004: M6H9-L1D4-VECTOR-ECHO\nLOG-005: F3K7-G2N5-SIGNAL-FOXTROT\nLOG-006: R8V4-C6A1-CHANNEL-GAMMA</pre></div>',
      answer_hash: "", answer_salt: "", fragment: "UN",
      hint_1: "Not every line matters.", hint_2: "The rule is in Level 3 fragment.", hint_3: "Even-numbered lines with a specific prefix.", is_active: true },
    { level_id: 5, title: "Fractured Logic", challenge_type: "coding_challenge",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Broken Syntax</h2><p>The systems are failing. Reconstruct the syntax to find the beacon.</p><pre class="code-block">def greet(name)  # missing colon\n    print("Hello", name)\ngreet("Agent")</pre><pre class="code-block">const data = {\n  mission: "find the key",\n  agent: "classified"\n  // missing closing brace\nconsole.log(data.mission);</pre></div>',
      answer_hash: "", answer_salt: "", fragment: "T_",
      hint_1: "Fix both programs. Read the output carefully.", hint_2: "Decode what you find in Program A output.", hint_3: "Combine A + B to form a URL.", is_active: true },
    { level_id: 6, title: "The Vault", challenge_type: "zip_challenge",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Package Intercept</h2><p>A secured payload was dropped. You already have the keys if you\'ve been paying attention.</p></div>',
      answer_hash: "", answer_salt: "", fragment: "HU",
      hint_1: "You need earlier fragments.", hint_2: "Combine fragments from Levels 1-4.", hint_3: "Only one file in the ZIP is real.", is_active: true },
    { level_id: 7, title: "Ghost in the Machine", challenge_type: "exif_base64",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Invisible Ink</h2><p>This image was sent by the rogue agent. There is more than meets the eye.</p></div>',
      answer_hash: "", answer_salt: "", fragment: "NT",
      hint_1: "Every photo remembers more than you see.", hint_2: "Metadata is data about data.", hint_3: "EXIF Comment field. Base64 then ROT13.", is_active: true },
    { level_id: 8, title: "The Breach", challenge_type: "db_investigation",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Data Recovery</h2><p>We recovered a corrupted table dump. Cross-reference the anomalies.</p></div>',
      answer_hash: "", answer_salt: "", fragment: "ER",
      hint_1: "One record stands out.", hint_2: "One key is an MD5 hash.", hint_3: "Use MD5 lookup on each key.", is_active: true },
    { level_id: 9, title: "Silent Execution", challenge_type: "hidden_function",
      content_html: '<div class="challenge-content"><h2>Mission Brief: Dormant Code</h2><p>The script is loaded, but waiting for the trigger.</p></div>',
      answer_hash: "", answer_salt: "", fragment: "S_",
      hint_1: "Not every function is called automatically.", hint_2: "Check the browser console.", hint_3: "Type revealMission() in console.", is_active: true },
    { level_id: 10, title: "Operation Blackout", challenge_type: "final_boss",
      content_html: '<div class="challenge-content"><h2>Mission Brief: The Final Assembly</h2><p>You have everything you need. Put the pieces together backwards to stop the blackout.</p></div>',
      answer_hash: "", answer_salt: "", fragment: "",
      hint_1: "Check your inventory.", hint_2: "Reverse the level order.", hint_3: "Assemble in reverse. Remove underscores.", is_active: true },
  ];

  const MOCK_PROGRESS = [
    { team_id: "TEAM-X7K92", level_id: 1, started_at: "2026-06-25T10:01:00Z", solved_at: null, attempts: 0, hints_used: [] },
  ];

  const MOCK_EVENT_SETTINGS = {
    id: 1, event_start: "2026-06-25T00:00:00Z", event_end: "2026-12-31T23:59:59Z",
    is_paused: false, paused_at: null, total_paused_ms: 0,
    registration_open: true, results_published: false,
  };

  delete (globalThis as any).MOCK_DB_STATE;
  if (!(globalThis as any).MOCK_DB_STATE) {
    (globalThis as any).MOCK_DB_STATE = {
      teams: [{ ...MOCK_TEAM }],
      levels: MOCK_LEVELS.map((l) => ({ ...l })),
      progress: MOCK_PROGRESS.map((p) => ({ ...p })),
      event_settings: [{ ...MOCK_EVENT_SETTINGS }],
      submissions: [],
      admin_users: [],
      final_submissions: [],
    };
  }
  const allData: Record<string, MockRow[]> = (globalThis as any).MOCK_DB_STATE;

  type MockRow = Record<string, unknown>;

  function filterRows(rows: MockRow[], filters: { col: string; val: unknown }[], inFilter: { col: string; vals: unknown[] } | null, notNullFilter: { col: string; negate: boolean } | null): MockRow[] {
    let result = [...rows];
    for (const f of filters) {
      result = result.filter((r) => r[f.col] === f.val);
    }
    if (inFilter) {
      result = result.filter((r) => inFilter.vals.includes(r[inFilter.col]));
    }
    if (notNullFilter) {
      result = result.filter((r) => {
        const val = r[notNullFilter.col];
        return notNullFilter.negate ? val !== null : val === null;
      });
    }
    return result;
  }

  const handler = {
    get(_target: unknown, prop: string) {
      if (prop === "from") {
        return (table: string) => {
          const filters: { col: string; val: unknown }[] = [];
          let inFilter: { col: string; vals: unknown[] } | null = null;
          let notNullFilter: { col: string; negate: boolean } | null = null;
          let orderCol = "";
          let orderAsc = true;
          let singleResult = false;

          const chain: Record<string, unknown> = {};

          const buildResult = () => {
            let rows = [...(allData[table] || [])];
            rows = filterRows(rows, filters, inFilter, notNullFilter);
            if (orderCol) {
              rows.sort((a, b) => {
                const aVal = a[orderCol];
                const bVal = b[orderCol];
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                const cmp = String(aVal).localeCompare(String(bVal));
                return orderAsc ? cmp : -cmp;
              });
            }
            return singleResult ? { data: rows[0] || null, error: null } : { data: rows, error: null };
          };

          chain.select = (_cols?: string) => chain;

          chain.eq = (col: string, val: unknown) => {
            filters.push({ col, val });
            return chain;
          };

          chain.update = (updates: Record<string, unknown>) => {
            return {
              eq: (col: string, val: unknown) => {
                filters.push({ col, val });
                return {
                  eq: (col2: string, val2: unknown) => {
                    filters.push({ col: col2, val: val2 });
                    return { then: (resolve: any) => resolve(buildUpdateResult(updates)) };
                  },
                  then: (resolve: any) => resolve(buildUpdateResult(updates))
                };
              },
              then: (resolve: any) => resolve(buildUpdateResult(updates))
            };
          };

          chain.insert = (data: Record<string, unknown>) => {
            return {
              then: (resolve: any) => {
                if (!allData[table]) allData[table] = [];
                allData[table].push(data);
                resolve({ data: [data], error: null });
              }
            };
          };

          const buildUpdateResult = (updates: Record<string, unknown>) => {
            let count = 0;
            if (allData[table]) {
              allData[table].forEach((row) => {
                let match = true;
                for (const f of filters) {
                  if (row[f.col] !== f.val) match = false;
                }
                if (match) {
                  Object.assign(row, updates);
                  count++;
                }
              });
            }
            return { data: null, error: null };
          };

          chain.in = (col: string, vals: unknown[]) => {
            inFilter = { col, vals };
            return chain;
          };

          chain.not = (col: string, op: string, _val: unknown) => {
            if (op === "is") notNullFilter = { col, negate: true };
            return chain;
          };

          chain.is = (col: string, val: unknown) => {
            if (val === null) notNullFilter = { col, negate: false };
            return chain;
          };

          chain.neq = (col: string, val: unknown) => {
            if (val === null) notNullFilter = { col, negate: true };
            else filters.push({ col, val }); // For simplicity in mock
            return chain;
          };

          chain.gte = (col: string, val: unknown) => {
            // Simplified for mock: just ignore or properly filter.
            // For rate limit check, returning chain without filtering is fine
            return chain;
          };

          chain.order = (col: string, opts?: { ascending: boolean }) => {
            orderCol = col;
            orderAsc = opts?.ascending ?? true;
            return chain;
          };

          chain.limit = (count: number) => {
            // Note: simple mock doesn't fully implement limit logic in buildResult, 
            // but we need to prevent the 'is not a function' error.
            return chain;
          };

          chain.single = () => {
            singleResult = true;
            return chain;
          };

          chain.then = (resolve: (r: { data: unknown; error: null }) => void) => {
            resolve(buildResult());
          };

          return chain;
        };
      }

      if (prop === "storage") {
        return {
          from: (_bucket: string) => ({
            upload: (_path: string, _data: unknown, _opts?: unknown) => ({
              then: (resolve: (r: { data: { path: string }; error: null }) => void) =>
                resolve({ data: { path: "mock/path" }, error: null }),
            }),
            getPublicUrl: (path: string) => ({
              data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/uploads/${path}` },
            }),
          }),
        };
      }

      if (prop === "rpc") {
        return (_fn: string) => ({
          then: (resolve: (r: { data: unknown; error: null }) => void) =>
            resolve({ data: null, error: null }),
        });
      }

      return undefined;
    },
  };

  return new Proxy({}, handler) as unknown as SupabaseClient;
}

export const supabaseAdmin: SupabaseClient = isMockMode()
  ? createMockClient()
  : createRealClient();
