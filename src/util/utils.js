export async function postFetch(body, route) {
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify(body),
        mode: 'cors'
    };
    const url = 'http://127.0.0.1:8000' + route;
    let reponse = await fetch(url, requestOptions);
    return await reponse.json();
}

