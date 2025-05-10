// Configuração da API do Google
document.addEventListener('DOMContentLoaded', function() {
    const googleAuthBtn = document.getElementById('google-auth-btn');
    const googleSyncOptions = document.getElementById('google-sync-options');
    const confirmSyncBtn = document.getElementById('confirm-sync');
    
    // Substitua com suas credenciais reais do Google API
    const API_KEY = 'SUA_API_KEY';
    const CLIENT_ID = 'SEU_CLIENT_ID.apps.googleusercontent.com';
    
    // Escopos necessários
    const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
    
    let isSignedIn = false;
    
    if (googleAuthBtn) {
        googleAuthBtn.addEventListener('click', handleAuthClick);
    }
    
    if (confirmSyncBtn) {
        confirmSyncBtn.addEventListener('click', function() {
            const eventTitle = document.getElementById('event-title').value;
            const eventTime = document.getElementById('event-time').value;
            syncWithGoogle(eventTitle, eventTime);
        });
    }
    
    function handleAuthClick() {
        if (!isSignedIn) {
            // Carrega a API do cliente Google
            gapi.load('client:auth2', initClient);
        } else {
            // Se já estiver autenticado, mostra as opções de sincronização
            document.getElementById('google-auth-container').style.display = 'none';
            googleSyncOptions.style.display = 'block';
        }
    }
    
    function initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: SCOPES
        }).then(function() {
            // Ouve mudanças no status de autenticação
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            
            // Manipula o status inicial de autenticação
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            
            // Adiciona evento de clique para o botão de autenticação
            googleAuthBtn.onclick = handleAuthClick;
        }).catch(function(error) {
            console.error('Erro ao inicializar o cliente Google:', error);
            alert('Erro ao conectar com o Google. Verifique o console para mais detalhes.');
        });
    }
    
    function updateSigninStatus(isSignedIn) {
        this.isSignedIn = isSignedIn;
        if (isSignedIn) {
            console.log('Usuário autenticado com Google');
            document.getElementById('google-auth-container').style.display = 'none';
            googleSyncOptions.style.display = 'block';
        } else {
            // Se não estiver autenticado, mostra o botão de login
            document.getElementById('google-auth-container').style.display = 'block';
            googleSyncOptions.style.display = 'none';
            // Força a autenticação
            gapi.auth2.getAuthInstance().signIn();
        }
    }
    
    function syncWithGoogle(eventTitle, eventTime) {
        if (!selectedDate) {
            alert('Por favor, selecione uma data primeiro.');
            return;
        }
        
        if (!eventTitle) {
            alert('Por favor, insira um título para o evento.');
            return;
        }
        
        const dateKey = formatDateKey(selectedDate);
        const eventDescription = events[dateKey]?.text || 'Evento do Calendário Escolar';
        
        // Cria a data e hora do evento
        const [hours, minutes] = eventTime.split(':');
        const eventDate = new Date(selectedDate);
        eventDate.setHours(parseInt(hours), parseInt(minutes);
        
        const startDateTime = eventDate.toISOString();
        const endDateTime = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(); // +1 hora
        
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
        
        if (isSignedIn) {
            // Usa a API para criar o evento diretamente
            createGoogleCalendarEvent(event);
        } else {
            // Fallback - abre o Google Calendar com os dados pré-preenchidos
            const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}&details=${encodeURIComponent(eventDescription)}&sf=true&output=xml`;
            window.open(googleCalendarUrl, '_blank');
        }
    }
    
    function createGoogleCalendarEvent(event) {
        const request = gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });
        
        request.execute(function(event) {
            console.log('Evento criado: ' + event.htmlLink);
            alert('Evento criado com sucesso no Google Agenda!');
            document.getElementById('google-modal').style.display = 'none';
        });
    }
    
    // Exporta a função para ser acessível globalmente
    window.syncWithGoogle = syncWithGoogle;
});
