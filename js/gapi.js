// Configuração da API do Google
document.addEventListener('DOMContentLoaded', function() {
    const googleAuthBtn = document.getElementById('google-auth-btn');
    const googleSyncOptions = document.getElementById('google-sync-options');
    const confirmSyncBtn = document.getElementById('confirm-sync');
    
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
        // Carrega a API do cliente Google
        gapi.load('client:auth2', initClient);
    }
    
    function initClient() {
        gapi.client.init({
            apiKey: 'SUA_API_KEY',
            clientId: 'SEU_CLIENT_ID.apps.googleusercontent.com',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.events'
        }).then(function() {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            
            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            
            // Mostra as opções de sincronização
            document.getElementById('google-auth-container').style.display = 'none';
            googleSyncOptions.style.display = 'block';
        }).catch(function(error) {
            console.error('Erro ao inicializar o cliente Google:', error);
            
            // Fallback - permite sincronização básica mesmo sem autenticação
            document.getElementById('google-auth-container').style.display = 'none';
            googleSyncOptions.style.display = 'block';
        });
    }
    
    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            // Usuário autenticado
            console.log('Usuário autenticado com Google');
        } else {
            // Usuário não autenticado
            console.log('Usuário não autenticado');
        }
    }
    
    function syncWithGoogle(eventTitle, eventTime) {
        // Esta função é chamada pelo script.js principal
        console.log('Sincronizando com Google Agenda:', eventTitle, eventTime);
    }
});
