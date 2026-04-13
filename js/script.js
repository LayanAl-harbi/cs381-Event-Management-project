const eventData = [
  {
    id: 'basketball-tournament',
    title: 'Basketball Tournament',
    date: 'May 31, 2026',
    location: 'Main Gym',
    category: 'Sports',
    description: 'Compete with your classmates in a friendly basketball tournament. Teams will be formed on site and prizes awarded to the top performers.'
  },
  {
    id: 'study-skills-workshop',
    title: 'Study Skills Workshop',
    date: 'May 30, 2026',
    location: 'Room 204',
    category: 'Academic',
    description: 'Learn practical study techniques, time management strategies, and exam preparation tips to help you succeed this semester.'
  },
  {
    id: 'campus-movie-night',
    title: 'Campus Movie Night',
    date: 'Jun 5, 2026',
    location: 'Open Lawn',
    category: 'Social',
    description: 'Relax with friends under the stars and watch a popular film. Snacks and drinks will be available for attendees.'
  },
  {
    id: 'cultural-festival',
    title: 'Cultural Festival',
    date: 'Jun 12, 2026',
    location: 'Student Center',
    category: 'Cultural',
    description: 'Celebrate diversity with food, performances, and community booths showcasing different cultures from around the world.'
  },
  {
    id: 'soccer-championship',
    title: 'Soccer Championship',
    date: 'Jun 15, 2026',
    location: 'Sports Field',
    category: 'Sports',
    description: 'Watch or join the soccer championship featuring student teams from across the school. Bring your energy and cheer on your favorites.'
  },
  {
    id: 'career-development-seminar',
    title: 'Career Development Seminar',
    date: 'Jun 18, 2026',
    location: 'Auditorium',
    category: 'Academic',
    description: 'Get career advice from industry experts, learn how to build a strong resume, and practice interview skills in this seminar.'
  }
];

function goToEvents() {
  document.getElementById('accountModal').classList.add('active');
}

function handleModalChoice(hasAccount) {
  document.getElementById('accountModal').classList.remove('active');
  if (hasAccount) {
    window.location.href = 'login.html';
  } else {
    window.location.href = 'register.html';
  }
}

function goToLogin() {
  window.location.href = 'login.html';
}

let currentConfirmCallback = null;

function getCurrentUser() {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
}

function showConfirmModal(message, callback) {
  const modal = document.getElementById('confirmationModal');
  const messageElement = document.getElementById('modalMessage');
  currentConfirmCallback = callback;

  if (messageElement) {
    messageElement.textContent = message;
  }
  if (modal) {
    modal.classList.add('active');
  }
}

function hideConfirmModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function confirmModalChoice(confirmed) {
  hideConfirmModal();
  if (typeof currentConfirmCallback === 'function') {
    currentConfirmCallback(confirmed);
  }
}

function goToRegister() {
  window.location.href = 'register.html';
}

function registerForEvent(eventId, eventTitle) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    localStorage.setItem('selectedEventId', eventId);
    showConfirmModal('You need an account before registering for events. Would you like to create one now?', function(confirmed) {
      if (confirmed) {
        window.location.href = 'register.html';
      }
    });
    return;
  }

  showConfirmModal(`Do you want to register for "${eventTitle}"?`, function(confirmed) {
    if (!confirmed) {
      return;
    }

    const registrationData = {
      name: currentUser.name,
      studentId: currentUser.studentId,
      email: currentUser.email,
      major: currentUser.major,
      password: currentUser.password,
      dateOfBirth: currentUser.dateOfBirth,
      selectedEventId: eventId
    };

    saveRegistration(registrationData);
    showConfirmModal('Registration successful! Redirect to your dashboard?', function(goToDashboard) {
      if (goToDashboard) {
        window.location.href = 'dashboard.html';
      }
    });
  });
}

// Events page functionality
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('eventsGrid')) {
    initializeEventFilters();
    attachEventDetailLinks();
  }

  if (document.querySelector('.event-details-card')) {
    initializeEventDetailsPage();
  }

  if (document.getElementById('registrationForm')) {
    initializeRegistrationPage();
  }

  if (document.getElementById('dashboardPage')) {
    initializeDashboardPage();
  }

  if (document.getElementById('loginForm')) {
    initializeLoginPage();
  }
});

function initializeEventFilters() {
  const searchInput = document.querySelector('.search-input');
  const dateFilter = document.querySelectorAll('.filter-dropdown')[0];
  const categoryFilter = document.querySelectorAll('.filter-dropdown')[1];
  const eventsGrid = document.getElementById('eventsGrid');
  const eventCards = eventsGrid.querySelectorAll('.event-card');

  searchInput.addEventListener('input', function() {
    filterEvents();
  });

  dateFilter.addEventListener('change', function() {
    filterEvents();
  });

  categoryFilter.addEventListener('change', function() {
    filterEvents();
  });

  function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;
    const selectedCategory = categoryFilter.value;

    eventCards.forEach(card => {
      const title = card.querySelector('.event-card-title').textContent.toLowerCase();
      const category = card.dataset.category;
      const date = card.dataset.date;
      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = selectedCategory === 'Category' || category === selectedCategory.toLowerCase();
      let matchesDate = true;

      if (selectedDate !== 'Date') {
        const today = new Date();
        const eventDate = new Date(date);

        switch (selectedDate) {
          case 'Upcoming':
            matchesDate = eventDate >= today;
            break;
          case 'This Week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            matchesDate = eventDate >= today && eventDate <= weekFromNow;
            break;
          case 'This Month':
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            matchesDate = eventDate >= today && eventDate <= monthFromNow;
            break;
        }
      }

      if (matchesSearch && matchesCategory && matchesDate) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });

    updateGridLayout();
  }

  function updateGridLayout() {
    const visibleCards = Array.from(eventCards).filter(card => card.style.display !== 'none');

    if (visibleCards.length === 0) {
      if (!document.querySelector('.no-results')) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #7a8da3;">
            <h3>No events found matching your criteria</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        `;
        eventsGrid.appendChild(noResults);
      }
    } else {
      const noResults = document.querySelector('.no-results');
      if (noResults) {
        noResults.remove();
      }
    }
  }
}

function attachEventDetailLinks() {
  const eventCards = document.querySelectorAll('.event-card');

  eventCards.forEach(card => {
    const detailButton = card.querySelector('.event-details-btn');
    const registerButton = card.querySelector('.event-register-btn');
    const eventId = card.dataset.id;
    const eventTitle = card.querySelector('.event-card-title').textContent;

    if (detailButton) {
      detailButton.addEventListener('click', function() {
        window.location.href = `event details.html?id=${encodeURIComponent(eventId)}`;
      });
    }

    if (registerButton) {
      registerButton.addEventListener('click', function() {
        registerForEvent(eventId, eventTitle);
      });
    }
  });
}

function initializeEventDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');
  const event = eventData.find(item => item.id === eventId);

  if (event) {
    populateEventDetails(event);
  } else {
    displayEventNotFound();
  }
}

function populateEventDetails(event) {
  const titleElement = document.getElementById('detailTitle');
  const dateElement = document.getElementById('detailDate');
  const locationElement = document.getElementById('detailLocation');
  const categoryElement = document.getElementById('detailCategory');
  const descriptionElement = document.getElementById('detailDescription');
  const registerButton = document.getElementById('detailRegisterBtn');

  if (titleElement) {
    titleElement.textContent = event.title;
  }

  if (dateElement) {
    dateElement.textContent = `Date: ${event.date}`;
  }

  if (locationElement) {
    locationElement.textContent = `Location: ${event.location}`;
  }

  if (categoryElement) {
    categoryElement.textContent = `Category: ${event.category}`;
  }

  if (descriptionElement) {
    descriptionElement.textContent = event.description;
  }

  if (registerButton) {
    registerButton.addEventListener('click', function() {
      registerForEvent(event.id, event.title);
    });
  }
}

function displayEventNotFound() {
  const detailsCard = document.querySelector('.event-details-card');

  if (detailsCard) {
    detailsCard.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #4b5c7a;">
        <h2>Event not found</h2>
        <p>Please return to the events page and choose a valid event.</p>
        <button class="event-details-button" onclick="window.location.href='events.html'">Back to Events</button>
      </div>
    `;
  }
}

function initializeRegistrationPage() {
  const selectedEventId = localStorage.getItem('selectedEventId');
  const selectedEventDiv = document.getElementById('selectedEvent');
  const eventTitle = document.getElementById('eventTitle');
  const eventDate = document.getElementById('eventDate');
  const registrationForm = document.getElementById('registrationForm');
  let selectedEvent = null;

  if (selectedEventId) {
    selectedEvent = eventData.find(item => item.id === selectedEventId);
    if (selectedEvent) {
      selectedEventDiv.style.display = 'block';
      eventTitle.textContent = selectedEvent.title;
      eventDate.textContent = `Date: ${selectedEvent.date}`;
    } else {
      localStorage.removeItem('selectedEventId');
    }
  }

  registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('userName').value,
      studentId: document.getElementById('studentId').value,
      email: document.getElementById('userEmail').value,
      major: document.getElementById('userMajor').value,
      password: document.getElementById('userPassword').value,
      dateOfBirth: document.getElementById('userDob').value,
      selectedEventId: selectedEvent ? selectedEvent.id : null
    };

    localStorage.setItem('currentUser', JSON.stringify({
      name: formData.name,
      studentId: formData.studentId,
      email: formData.email,
      major: formData.major,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth
    }));

    if (selectedEvent) {
      saveRegistration(formData);
      localStorage.removeItem('selectedEventId');
      showConfirmModal('Registration successful! Continue to your dashboard?', function(confirmed) {
        if (confirmed) {
          window.location.href = 'dashboard.html';
        }
      });
    } else {
      showConfirmModal('Account created successfully! Continue to your dashboard?', function(confirmed) {
        if (confirmed) {
          window.location.href = 'dashboard.html';
        }
      });
    }
  });
}

function saveRegistration(registrationData) {
  // In a real application, this would send data to your backend
  // For now, we'll store it in localStorage as an example
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  registrations.push({
    ...registrationData,
    id: Date.now(),
    registeredAt: new Date().toISOString(),
    markedPast: false
  });
  localStorage.setItem('registrations', JSON.stringify(registrations));

  console.log('Registration saved:', registrationData);
}

function initializeLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const studentId = document.getElementById('loginStudentId').value.trim();
    const password = document.getElementById('loginPassword').value;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      showConfirmModal('No registered user found. Would you like to create an account now?', function(confirmed) {
        if (confirmed) {
          window.location.href = 'register.html';
        }
      });
      return;
    }

    if (studentId === currentUser.studentId && password === currentUser.password) {
      showConfirmModal('Login successful! Go to your dashboard?', function(confirmed) {
        if (confirmed) {
          window.location.href = 'dashboard.html';
        }
      });
      return;
    }

    alert('Invalid login credentials. Please try again or register a new account.');
  });
}

function initializeDashboardPage() {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const newContainer = document.getElementById('newRegistrations');
  const pastContainer = document.getElementById('pastRegistrations');
  const welcome = document.getElementById('dashboardWelcome');

  if (!newContainer || !pastContainer || !welcome) return;

  const currentUser = getCurrentUser();
  welcome.textContent = `Welcome, ${currentUser.name}`;

  const sortedRegistrations = registrations.slice().sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const today = new Date();
  const newRegistrations = [];
  const pastRegistrations = [];

  sortedRegistrations.forEach(reg => {
    const event = eventData.find(item => item.id === reg.selectedEventId);
    const isPastEvent = reg.markedPast || (event ? new Date(event.date) < today : false);
    const targetList = isPastEvent ? pastRegistrations : newRegistrations;
    targetList.push({ ...reg, event });
  });

  renderRegistrations(newContainer, newRegistrations, true);
  renderRegistrations(pastContainer, pastRegistrations, false);
}

function renderRegistrations(container, registrations, isNew) {
  container.innerHTML = '';
  if (!registrations.length) {
    container.innerHTML = '<div class="empty-list">No registrations found.</div>';
    return;
  }

  registrations.forEach(reg => {
    const item = document.createElement('div');
    item.className = 'registration-item';

    const meta = document.createElement('div');
    meta.className = 'registration-meta';
    meta.innerHTML = `
      <strong>${reg.event ? reg.event.title : 'Unknown Event'}</strong>
      <span>${reg.event ? reg.event.date : ''}</span>
      <span>${reg.event ? reg.event.location : ''}</span>
    `;

    const actions = document.createElement('div');
    actions.className = 'registration-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-btn';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', function() {
      if (reg.selectedEventId) {
        window.location.href = `event details.html?id=${encodeURIComponent(reg.selectedEventId)}`;
      }
    });

    const actionBtn = document.createElement('button');
    if (isNew) {
      actionBtn.className = 'delete-btn';
      actionBtn.textContent = 'Mark Past';
      actionBtn.addEventListener('click', function() {
        markRegistrationPast(reg.id);
      });
    } else {
      actionBtn.className = 'feedback-btn';
      actionBtn.textContent = 'Feedback';
      actionBtn.addEventListener('click', function() {
        alert('Feedback will be added later for this event.');
      });
    }

    actions.appendChild(viewBtn);
    actions.appendChild(actionBtn);

    item.appendChild(meta);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

function deleteRegistration(registrationId) {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const filtered = registrations.filter(reg => reg.id !== registrationId);
  localStorage.setItem('registrations', JSON.stringify(filtered));
  initializeDashboardPage();
}

function markRegistrationPast(registrationId) {
  const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
  const updated = registrations.map(reg => {
    if (reg.id === registrationId) {
      return { ...reg, markedPast: true };
    }
    return reg;
  });
  localStorage.setItem('registrations', JSON.stringify(updated));
  initializeDashboardPage();
}
