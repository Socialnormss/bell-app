/* ===========================================
   Bell V1 — Sales AI Assistant
   No backend, no API. Just prompt builder + formatter.
   =========================================== */

/* ---------- Prompt templates ---------- */

const PROMPT_MEETING = (notes) => `คุณคือผู้ช่วยสรุปประชุมที่ละเอียดและตรงประเด็น
ช่วยสรุป meeting notes ต่อไปนี้เป็นภาษาไทย ตามรูปแบบนี้ทุกครั้ง:

## สรุป
- (3-5 bullet ใจความสำคัญ)

## Action Items
- [ใคร]: [งานที่ต้องทำ] — deadline: [วันที่/เวลา ถ้ามี]

## Next Steps
- (สิ่งที่ต้องทำต่อ / ติดตาม)

ถ้า notes ไม่ครบ ให้เขียน "—" แทนการเดา
ใช้ภาษาธุรกิจกระชับ ไม่ใช้คำสุภาพมากเกิน

---

Meeting Notes:

${notes}`;

const PROMPT_BRIEF = (draft) => `คุณคือ Production Coordinator ที่เข้าใจงาน media agency
ช่วยแปลง draft / proposal ต่อไปนี้ เป็น Production Brief ที่ส่งให้ทีม production ทำต่อได้เลย
ใช้ภาษาไทย ตามรูปแบบนี้ทุกครั้ง:

## Platform
- (FB / IG / TikTok / YouTube / อื่นๆ)

## Format
- (Video / Reels / Banner / Story / Live / อื่นๆ — รวม spec ถ้ามี)

## Key Message
- (สาระสำคัญที่ต้องสื่อ 1-2 ประโยค)

## Deliverables
- (รายการชิ้นงานที่ต้องส่ง พร้อมจำนวน)

## Timeline
- Brief → Draft: [วัน/วันที่]
- Draft → Final: [วัน/วันที่]
- ส่งงาน: [วัน/วันที่]

ถ้า draft ไม่ระบุข้อมูล ให้เขียน "TBD" และใส่ใน Action Items ท้ายสุดว่าต้องถามลูกค้าเพิ่มเรื่องอะไร

---

Draft:

${draft}`;

/* ---------- Toast ---------- */

const toast = document.getElementById('toast');
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

/* ---------- Tabs ---------- */

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.feature').forEach(f => f.classList.toggle('active', f.id === target));
  });
});

/* ---------- Copy buttons ---------- */

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copy แล้ว ✓');
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copy แล้ว ✓');
  }
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-copy]');
  if (t) {
    const el = document.getElementById(t.dataset.copy);
    if (el) copyText(el.textContent);
    return;
  }
  const t2 = e.target.closest('[data-copy-text]');
  if (t2) {
    const el = document.getElementById(t2.dataset.copyText);
    if (el) copyText(el.innerText);
  }
});

/* ---------- Markdown → HTML (lightweight) ---------- */

function renderMarkdown(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inList = false;

  const flushList = () => {
    if (inList) { html += '</ul>'; inList = false; }
  };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }

    // H1/H2/H3 → all rendered as h3
    if (/^#{1,3}\s+/.test(line)) {
      flushList();
      html += `<h3>${escapeHtml(line.replace(/^#{1,3}\s+/, ''))}</h3>`;
      continue;
    }

    // bullet
    if (/^[-*•]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineFormat(line.replace(/^[-*•]\s+/, ''))}</li>`;
      continue;
    }

    // numbered list → treat as bullet
    if (/^\d+\.\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineFormat(line.replace(/^\d+\.\s+/, ''))}</li>`;
      continue;
    }

    flushList();
    html += `<p>${inlineFormat(line)}</p>`;
  }
  flushList();
  return html;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function inlineFormat(s) {
  s = escapeHtml(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

/* ---------- Feature handlers ---------- */

function wireFeature(id, promptFn) {
  const input = document.getElementById(`${id}-input`);
  const buildBtn = document.getElementById(`${id}-build`);
  const promptCard = document.getElementById(`${id}-prompt-card`);
  const promptEl = document.getElementById(`${id}-prompt`);
  const outputCard = document.getElementById(`${id}-output-card`);
  const outputEl = document.getElementById(`${id}-output`);
  const formatBtn = document.getElementById(`${id}-format`);
  const resultCard = document.getElementById(`${id}-result-card`);
  const resultEl = document.getElementById(`${id}-result`);

  buildBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) {
      showToast('ใส่ข้อความก่อนนะ');
      input.focus();
      return;
    }
    promptEl.textContent = promptFn(text);
    promptCard.classList.remove('hidden');
    outputCard.classList.remove('hidden');
    promptCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  formatBtn.addEventListener('click', () => {
    const text = outputEl.value.trim();
    if (!text) {
      showToast('วางคำตอบจาก AI ก่อน');
      outputEl.focus();
      return;
    }
    resultEl.innerHTML = renderMarkdown(text);
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

wireFeature('f1', PROMPT_MEETING);
wireFeature('f2', PROMPT_BRIEF);
