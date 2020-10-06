const db_URL = "http://localhost:3000/todos";
const imgs_URL = "http://localhost:3000/imgs";

const getData = (url, cb) => {
    return fetch(url).then(data => data.json()).then(res => cb(res));
}

const sendData = (url, data) => {
    return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

export { getData, sendData, db_URL as API, imgs_URL as imgs };
