const API = 'https://app.pumpgtm.com/api/v1';
const $ = (id) => document.getElementById(id);
let workspaceKey = '';
let profile = null;

function showStatus(text, kind) {
  $('status').textContent = text;
  $('status').className = kind || '';
}

async function callApi(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { Authorization: 'Bearer ' + workspaceKey, 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('That workspace key was not accepted. Paste a current key from PumpGTM settings.');
  if (!res.ok) throw new Error(body.message || body.error || 'PumpGTM returned ' + res.status + '.');
  return body;
}

function readLinkedInProfile(tab) {
  const match = (tab.url || '').match(/^https:\/\/([a-z]+\.)?linkedin\.com\/in\/([^/?#]+)/i);
  if (!match) return null;
  const slug = decodeURIComponent(match[2]);
  const name = (tab.title || '').replace(/^\(\d+\)\s*/, '').split(' | ')[0].trim();
  return { linkedinUrl: 'https://www.linkedin.com/in/' + slug + '/', person: name && name !== 'LinkedIn' ? name : slug };
}

function showSettings() {
  $('add').hidden = true;
  $('settings').hidden = false;
  $('key').value = '';
}

async function showAddForm() {
  $('settings').hidden = true;
  if (!profile) return showStatus('Open a LinkedIn profile (linkedin.com/in/...) to add that person.', 'error');
  $('profileUrl').textContent = profile.linkedinUrl;
  showStatus('Loading sequences...');
  try {
    const { sequences } = await callApi('/sequences');
    if (!sequences.length) throw new Error('This workspace has no sequences yet. Create one in PumpGTM first.');
    $('sequence').replaceChildren(...sequences.map((s) => new Option(s.name + ' (' + s.status + ')', s.id)));
    $('add').hidden = false;
    showStatus('');
  } catch (e) {
    showStatus(e.message, 'error');
    if (e.message.startsWith('That workspace key')) showSettings();
  }
}

$('saveKey').onclick = async () => {
  workspaceKey = $('key').value.trim();
  if (!workspaceKey) return showStatus('Paste your workspace key first.', 'error');
  await chrome.storage.local.set({ workspaceKey });
  showAddForm();
};

$('changeKey').onclick = () => { showStatus(''); showSettings(); };

$('addLead').onclick = async () => {
  $('addLead').disabled = true;
  showStatus('Adding...');
  try {
    const { addResult } = await callApi('/sequences/' + $('sequence').value + '/leads', {
      method: 'POST',
      body: JSON.stringify({ method: 'contacts', leads: [profile] }),
    });
    const summary = addResult.summary;
    if (summary.addedCount > 0) showStatus('Added ' + profile.person + ' to the sequence.', 'ok');
    else if (summary.duplicatesSkipped > 0) showStatus(profile.person + ' is already a lead in this workspace.', 'error');
    else showStatus('Not added: this sequence has no LinkedIn steps.', 'error');
  } catch (e) {
    showStatus(e.message, 'error');
  }
  $('addLead').disabled = false;
};

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  profile = tab ? readLinkedInProfile(tab) : null;
  ({ workspaceKey = '' } = await chrome.storage.local.get('workspaceKey'));
  if (workspaceKey) showAddForm(); else showSettings();
})();
