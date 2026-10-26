/* ═══════════════════════════════════════════════════════════════
   app.js — Dynamic Profile Card Generator (Frontend Logic)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Config ──────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api/profile';

// ── DOM references ───────────────────────────────────────────────
const profileForm    = document.getElementById('profileForm');
const nameInput      = document.getElementById('name');
const bioInput       = document.getElementById('bio');
const imageUrlInput  = document.getElementById('imageUrl');

const nameError      = document.getElementById('nameError');
const bioError       = document.getElementById('bioError');
const imageError     = document.getElementById('imageError');

const nameCounter    = document.getElementById('nameCounter');
const bioCounter     = document.getElementById('bioCounter');

const submitBtn      = document.getElementById('submitBtn');
const btnText        = submitBtn.querySelector('.btn-text');
const btnLoader      = document.getElementById('btnLoader');
const formStatus     = document.getElementById('formStatus');

const imagePreviewWrap = document.getElementById('imagePreviewWrap');
const imagePreview     = document.getElementById('imagePreview');
const previewFallback  = document.getElementById('previewFallback');

const cardPlaceholder  = document.getElementById('cardPlaceholder');
const profileCard      = document.getElementById('profileCard');
const cardBand         = document.getElementById('cardBand');
const cardAvatar       = document.getElementById('cardAvatar');
const cardInitials     = document.getElementById('cardInitials');
const cardName         = document.getElementById('cardName');
const cardBio          = document.getElementById('cardBio');
const cardMeta         = document.getElementById('cardMeta');
const resetBtn         = document.getElementById('resetBtn');

// ── Character counters ───────────────────────────────────────────
function updateCounter(input, counterEl, max) {
  const len = input.value.length;
  counterEl.textContent = `${len} / ${max}`;
  counterEl.classList.toggle('near-limit', len >= max * 0.8 && len < max);
  counterEl.classList.toggle('at-limit',   len >= max);
}

nameInput.addEventListener('input', () => updateCounter(nameInput, nameCounter, 100));
bioInput.addEventListener('input',  () => updateCounter(bioInput,  bioCounter,  500));

// ── Live image preview ───────────────────────────────────────────
let previewDebounce;

imageUrlInput.addEventListener('input', () => {
  clearTimeout(previewDebounce);
  const url = imageUrlInput.value.trim();

  if (!url) {
    imagePreviewWrap.classList.remove('show');
    clearImageError();
    return;
  }

  imagePreviewWrap.classList.add('show');
  previewDebounce = setTimeout(() => loadPreviewImage(url), 500);
});

function loadPreviewImage(url) {
  imagePreview.classList.remove('loaded');
  previewFallback.style.display = 'flex';

  const testImg = new Image();

  testImg.onload = () => {
    imagePreview.src = url;
    imagePreview.classList.add('loaded');
    previewFallback.style.display = 'none';
    clearImageError();
  };

  testImg.onerror = () => {
    imagePreview.classList.remove('loaded');
    previewFallback.style.display = 'flex';
    showFieldError(imageError, imageUrlInput, '⚠ Could not load this image URL.');
  };

  testImg.src = url;
}

// ── Validation helpers ───────────────────────────────────────────
function showFieldError(errorEl, inputEl, msg) {
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
  inputEl.classList.add('input-error');
}

function clearFieldError(errorEl, inputEl) {
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  inputEl.classList.remove('input-error');
}

function clearImageError() {
  clearFieldError(imageError, imageUrlInput);
}

function validateForm() {
  let valid = true;

  clearFieldError(nameError, nameInput);
  clearFieldError(bioError, bioInput);

  const name = nameInput.value.trim();
  const bio  = bioInput.value.trim();

  if (!name) {
    showFieldError(nameError, nameInput, '⚠ Full name is required.');
    valid = false;
  } else if (name.length > 100) {
    showFieldError(nameError, nameInput, '⚠ Name must be 100 characters or fewer.');
    valid = false;
  }

  if (!bio) {
    showFieldError(bioError, bioInput, '⚠ Bio is required.');
    valid = false;
  } else if (bio.length > 500) {
    showFieldError(bioError, bioInput, '⚠ Bio must be 500 characters or fewer.');
    valid = false;
  }

  return valid;
}

// ── Loading state helpers ────────────────────────────────────────
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnText.classList.toggle('hide', isLoading);
  btnLoader.classList.toggle('show', isLoading);
}

function showFormStatus(type, message) {
  formStatus.className = `form-status ${type}`;
  formStatus.textContent = message;
}

function clearFormStatus() {
  formStatus.className = 'form-status';
  formStatus.textContent = '';
}

// ── Profile card renderer ────────────────────────────────────────
function renderProfileCard(profile) {
  // Avatar or initials fallback
  if (profile.image_url) {
    cardAvatar.src = profile.image_url;
    cardAvatar.alt = profile.name;
    cardAvatar.style.display = 'block';
    cardInitials.style.display = 'none';
  } else {
    cardAvatar.style.display = 'none';
    cardInitials.textContent = profile.initials || '?';
    cardInitials.style.display = 'flex';
  }

  cardName.textContent = profile.name;
  cardBio.textContent  = profile.bio;
  cardMeta.innerHTML   = profile.created_at
    ? `🕐 ${profile.created_at}`
    : '';

  // Show card, hide placeholder
  cardPlaceholder.style.display = 'none';
  profileCard.hidden = false;

  // Scroll card into view on mobile
  if (window.innerWidth <= 768) {
    profileCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ── Form submit handler ──────────────────────────────────────────
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormStatus();

  if (!validateForm()) return;

  const payload = {
    name:      nameInput.value.trim(),
    bio:       bioInput.value.trim(),
    image_url: imageUrlInput.value.trim() || null,
  };

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Server returned an error
      showFormStatus('error', `❌ ${data.error || 'Something went wrong. Please try again.'}`);
      return;
    }

    // ✅ Success — render the profile card
    showFormStatus('success', `✅ ${data.message}`);
    renderProfileCard(data.profile);

  } catch (err) {
    // Network / CORS / parse error
    console.error('Request failed:', err);
    showFormStatus(
      'error',
      '❌ Could not reach the server. Make sure the Flask backend is running on port 5000.'
    );
  } finally {
    setLoading(false);
  }
});

// ── Reset button ─────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  // Hide card, show placeholder
  profileCard.hidden = true;
  cardPlaceholder.style.display = '';

  // Reset form
  profileForm.reset();
  clearFormStatus();
  clearFieldError(nameError, nameInput);
  clearFieldError(bioError,  bioInput);
  clearImageError();

  // Reset counters
  nameCounter.textContent = '0 / 100';
  bioCounter.textContent  = '0 / 500';
  nameCounter.className   = 'char-counter';
  bioCounter.className    = 'char-counter';

  // Hide preview
  imagePreviewWrap.classList.remove('show');
  imagePreview.classList.remove('loaded');
  imagePreview.src = '';

  // Focus name field
  nameInput.focus();
});

// ── Inline validation on blur (UX improvement) ───────────────────
nameInput.addEventListener('blur', () => {
  if (!nameInput.value.trim()) {
    showFieldError(nameError, nameInput, '⚠ Full name is required.');
  } else {
    clearFieldError(nameError, nameInput);
  }
});

bioInput.addEventListener('blur', () => {
  if (!bioInput.value.trim()) {
    showFieldError(bioError, bioInput, '⚠ Bio is required.');
  } else {
    clearFieldError(bioError, bioInput);
  }
});

// Clear errors when user starts typing again
nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) clearFieldError(nameError, nameInput);
});
bioInput.addEventListener('input', () => {
  if (bioInput.value.trim()) clearFieldError(bioError, bioInput);
});
