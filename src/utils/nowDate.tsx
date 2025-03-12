export const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
