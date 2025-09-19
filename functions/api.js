/**
 * 
 * @param {string} urlApi 
 * @param {RequestInit} options 
 */
export async function fetchJSON (urlApi, options = {}) {
    const headers = {
        'Content-Type' : 'application/json',
        Accept : 'application/json',
        ...options.headers
    }
    const response = await fetch(urlApi, {...options,headers})
    if(response.ok) {
        return await response.json()
    }
    throw new Error('Impossible de contacter le serveur', {cause : response})
}