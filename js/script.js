document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let currentDate = new Date();
    let selectedDate = null;
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let selectedColor = '#FF5733'; // Cor padrão
    
    // Elementos do DOM
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const selectedDateElement = document.getElementById('selected-date');
    const eventText = document.getElementById('event-text');
    const saveEventBtn = document.getElementById('save-event');
    const sendEmailBtn = document.getElementById('send-email');
    const syncGoogleBtn = document.getElementById('sync-google');
    const clearDayBtn = document.getElementById('clear-day');
    const eventList = document.getElementById('event-list');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const emailModal = document.getElementById('email-modal');
    const googleModal = document.getElementById('google-modal');
    const emailForm = document.getElementById('email-form');
    const closeButtons = document.querySelectorAll('.close');

    // Color Picker
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });

    // Seleciona a primeira cor por padrão
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('selected');
    }
    
    // Inicialização
    renderCalendar();
    updateSelectedDate(new Date());
    
    // Event Listeners
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    prevYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalendar();
    });
    
    nextYearBtn.addEventListener('click', () => {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalendar();
    });
    
    saveEventBtn.addEventListener('click', saveEvent);
    sendEmailBtn.addEventListener('click', () => emailModal.style.display = 'block');
    syncGoogleBtn.addEventListener('click', () => googleModal.style.display = 'block');
    clearDayBtn.addEventListener('click', clearDayEvents);
    emailForm.addEventListener('submit', sendEmail);
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Funções
    function renderCalendar() {
        // Limpa o calendário
        calendarDays.innerHTML = '';
        
        // Atualiza o cabeçalho com o mês/ano atual
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        currentMonthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        // Define a cor do mês
        document.querySelector('.calendar').className = 'calendar';
        document.querySelector('.calendar').classList.add(monthNames[currentDate.getMonth()].toLowerCase());
        
        // Obtém o primeiro dia do mês e o último dia do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Obtém o dia da semana do primeiro dia (0-6, onde 0 é domingo)
        const startDay = firstDay.getDay();
        
        // Obtém o número total de dias no mês
        const totalDays = lastDay.getDate();
        
        // Obtém o número total de dias do mês anterior para preencher o calendário
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        // Obtém o número total de dias do próximo mês para preencher o calendário
        const daysInNextMonth = 6 - lastDay.getDay();
        
        // Renderiza os dias do mês anterior (se necessário)
        for (let i = startDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true);
            calendarDays.appendChild(dayElement);
        }
        
        // Renderiza os dias do mês atual
        for (let i = 1; i <= totalDays; i++) {
            const dayElement = createDayElement(i, false);
            
            // Verifica se é o dia atual
            const today = new Date();
            if (currentDate.getFullYear() === today.getFullYear() && 
                currentDate.getMonth() === today.getMonth() && 
                i === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Verifica se há eventos para este dia
            const dateKey = formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
            if (events[dateKey]) {
                const indicator = document.createElement('div');
                indicator.className = 'event-indicator';
                indicator.style.backgroundColor = events[dateKey].color;
                dayElement.appendChild(indicator);
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        // Renderiza os dias do próximo mês (se necessário)
        for (let i = 1; i <= daysInNextMonth; i++) {
            const dayElement = createDayElement(i, true);
            calendarDays.appendChild(dayElement);
        }
    }
    
    function createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        } else {
            dayElement.addEventListener('click', () => {
                const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                updateSelectedDate(clickedDate);
            });
        }
        
        return dayElement;
    }
    
    function updateSelectedDate(date) {
        selectedDate = date;
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateElement.textContent = date.toLocaleDateString('pt-BR', options);
        
        // Carrega os eventos para a data selecionada
        const dateKey = formatDateKey(date);
        eventText.value = events[dateKey]?.text || '';
        
        // Atualiza a cor selecionada
        if (events[dateKey]?.color) {
            const colorOption = document.querySelector(`.color-option[data-color="${events[dateKey].color}"]`);
            if (colorOption) {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                colorOption.classList.add('selected');
                selectedColor = events[dateKey].color;
            }
        }
        
        // Atualiza a lista de eventos
        updateEventList();
    }
    
    function formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    function saveEvent() {
        if (!selectedDate) return;
        
        const dateKey = formatDateKey(selectedDate);
        
        if (eventText.value.trim()) {
            events[dateKey] = {
                text: eventText.value.trim(),
                color: selectedColor
            };
            
            // Atualiza o indicador de evento no calendário
            const dayElements = calendarDays.querySelectorAll('div:not(.other-month)');
            const selectedDayElement = Array.from(dayElements).find(el => 
                parseInt(el.textContent) === selectedDate.getDate());
            
            if (selectedDayElement) {
                // Remove indicadores antigos
                const oldIndicators = selectedDayElement.querySelectorAll('.event-indicator');
                oldIndicators.forEach(ind => ind.remove());
                
                // Adiciona novo indicador
                const indicator = document.createElement('div');
                indicator.className = 'event-indicator';
                indicator.style.backgroundColor = selectedColor;
                selectedDayElement.appendChild(indicator);
            }
        } else {
            delete events[dateKey];
            
            // Remove o indicador de evento no calendário
            const dayElements = calendarDays.querySelectorAll('div:not(.other-month)');
            const selectedDayElement = Array.from(dayElements).find(el => 
                parseInt(el.textContent) === selectedDate.getDate());
            
            if (selectedDayElement) {
                const indicators = selectedDayElement.querySelectorAll('.event-indicator');
                indicators.forEach(ind => ind.remove());
            }
        }
        
        // Salva no localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Atualiza a lista de eventos
        updateEventList();
    }
    
    function updateEventList() {
        eventList.innerHTML = '';
        
        if (!selectedDate) return;
        
        const dateKey = formatDateKey(selectedDate);
        const eventData = events[dateKey];
        
        if (eventData) {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <p>${eventData.text}</p>
                <div class="event-date">${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            `;
            eventItem.style.setProperty('--event-color', eventData.color);
            eventList.appendChild(eventItem);
        }
    }
    
    function clearDayEvents() {
        if (!selectedDate) return;
        
        const dateKey = formatDateKey(selectedDate);
        delete events[dateKey];
        eventText.value = '';
        
        // Remove o indicador de evento no calendário
        const dayElements = calendarDays.querySelectorAll('div:not(.other-month)');
        const selectedDayElement = Array.from(dayElements).find(el => 
            parseInt(el.textContent) === selectedDate.getDate());
        
        if (selectedDayElement) {
            const indicators = selectedDayElement.querySelectorAll('.event-indicator');
            indicators.forEach(ind => ind.remove());
        }
        
        // Salva no localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Atualiza a lista de eventos
        updateEventList();
    }
    
    function sendEmail(e) {
        e.preventDefault();
        
        const emailAddress = document.getElementById('email-address').value;
        const emailSubject = document.getElementById('email-subject').value;
        const dateKey = formatDateKey(selectedDate);
        const eventData = events[dateKey] || { text: 'Nenhuma anotação para este dia.', color: '#000000' };
        
        const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
            `Anotações para ${selectedDate.toLocaleDateString('pt-BR')}:\n\n${eventData.text}\n\nCor: ${eventData.color}`
        )}`;
        
        window.location.href = mailtoLink;
        emailModal.style.display = 'none';
        
        document.getElementById('email-form').reset();
    }
    
    // Função para sincronizar com Google Agenda (implementada em gapi.js)
    window.syncWithGoogle = function(eventTitle, eventTime) {
        if (!selectedDate) return;
        
        const dateKey = formatDateKey(selectedDate);
        const eventDescription = events[dateKey]?.text || 'Evento do Calendário Escolar';
        
        // Cria a data e hora do evento
        const [hours, minutes] = eventTime.split(':');
        const eventDate = new Date(selectedDate);
        eventDate.setHours(parseInt(hours), parseInt(minutes));
        
        // Formata para o formato ISO que o Google Agenda espera
        const startDateTime = eventDate.toISOString();
        const endDateTime = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora
        
        // Cria o link para adicionar ao Google Agenda
        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}&details=${encodeURIComponent(eventDescription)}&sf=true&output=xml`;
        
        // Abre em uma nova aba
        window.open(googleCalendarUrl, '_blank');
        
        googleModal.style.display = 'none';
    };
});
