document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let currentDate = new Date();
    let selectedDate = null;
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let selectedColor = '#FF5733'; // Cor padrão
    
    // ... (restante do código permanece igual até a função sendEmail)

    // Função para sincronizar com Google Agenda
    window.syncWithGoogle = function(eventTitle, eventTime) {
        if (!selectedDate) {
            alert('Por favor, selecione uma data primeiro.');
            return;
        }
        
        const dateKey = formatDateKey(selectedDate);
        const eventDescription = events[dateKey]?.text || 'Evento do Calendário Escolar';
        
        // Cria a data e hora do evento
        const [hours, minutes] = eventTime.split(':');
        const eventDate = new Date(selectedDate);
        eventDate.setHours(parseInt(hours), parseInt(minutes));
        
        // Formata para o formato ISO que o Google Agenda espera
        const startDateTime = eventDate.toISOString();
        const endDateTime = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora
        
        // Verifica se a API do Google está carregada e o usuário está autenticado
        if (window.gapi && window.gapi.auth2 && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
            // Cria o evento diretamente via API
            const event = {
                'summary': eventTitle,
                'description': eventDescription,
                'start': {
                    'dateTime': startDateTime,
                    'timeZone': 'America/Sao_Paulo'
                },
                'end': {
                    'dateTime': endDateTime,
                    'timeZone': 'America/Sao_Paulo'
                },
                'reminders': {
                    'useDefault': true
                }
            };
            
            const request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
            });
            
            request.execute(function(event) {
                console.log('Evento criado: ' + event.htmlLink);
                alert('Evento criado com sucesso no Google Agenda!');
                document.getElementById('google-modal').style.display = 'none';
            }, function(error) {
                console.error('Erro ao criar evento:', error);
                alert('Erro ao criar evento no Google Agenda. Verifique o console para mais detalhes.');
                // Fallback para o método de template
                openGoogleCalendarTemplate(eventTitle, startDateTime, endDateTime, eventDescription);
            });
        } else {
            // Fallback - abre o Google Calendar com os dados pré-preenchidos
            openGoogleCalendarTemplate(eventTitle, startDateTime, endDateTime, eventDescription);
        }
    };

    // Função auxiliar para abrir o template do Google Calendar
    function openGoogleCalendarTemplate(title, start, end, description) {
        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start.replace(/[-:]/g, '')}/${end.replace(/[-:]/g, '')}&details=${encodeURIComponent(description)}&sf=true&output=xml`;
        window.open(googleCalendarUrl, '_blank');
        document.getElementById('google-modal').style.display = 'none';
    }

    // Função para formatar chave de data (agora disponível para syncWithGoogle)
    function formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
});
