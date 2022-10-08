let GAME_SERVER = 'http://localhost:8080';
let TOKEN_REPOSITORY = {
    getAccessTokenWithType: function (mode) {
        if (!this.isNull()) {
            let tokens = this.getTokens();
            switch (mode) {
                case "access":
                    return tokens.type + ' ' + tokens.accessToken;
                case "refresh":
                    return tokens.type + ' ' + tokens.refreshToken;
            }
        }
    },
    setAccessToken: function (accessToken) {
        let ls = localStorage.getItem("tokens") ? JSON.parse(localStorage.getItem("tokens")) : null;
        ls.accessToken = accessToken;
        localStorage.setItem("tokens", JSON.stringify(ls));
    },
    setTokens: function (tokens) {

        localStorage.setItem("tokens", JSON.stringify(tokens));
    },
    getTokens: function () {
        let ls = localStorage.getItem("tokens") ? JSON.parse(localStorage.getItem("tokens")) : null;

        if (ls !== null) {
            return ls;
        } else {
            return null;
            console.info("localStorage is null");
        }
    },
    isNull: function () {
        return localStorage.getItem("tokens") ? false : true
    }
};

// очищаем локальное хранилище и redirect на указанный url
function errorRedirect(url) {
    localStorage.clear();
    window.location = url;
    return;
}

// Переустановка access токена (короткоживущего)
async function tokenReset() {
    try {
        let token = TOKEN_REPOSITORY.getTokens();
        let response = await fetch(GAME_SERVER + '/api/auth/token', {
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'POST',
            body: '{"refreshToken":"' + token.refreshToken + '"}'
        });

        let json = await response.json();
        TOKEN_REPOSITORY.setAccessToken(json.accessToken)
        return true;
    } catch (error) {
        return false;
    }
}

// Отправка запроса
async function sendQuery(url, tokenType, data) {
    try {
        if (DEBUG) console.info('-- start sendQuery --')
        if (DEBUG) console.info('отправка запроса ' + GAME_SERVER + '/' + url)
        let response1 = await fetch(GAME_SERVER + '/' + url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': TOKEN_REPOSITORY.getAccessTokenWithType(tokenType),
            },
            mode: 'cors',
            method: 'POST',
            body: data
        });
        // Если при перезагрузке страницы, ответ 403 авторизация не успешна,
        // скорее всего протух access токен (он короткоживущий)
        if (response1.status === 403) {
            // Обновляем токен и сразу используем его в условии
            console.info('ответ response.status 403, обновление токена');
            if (await tokenReset() === true) {
                if (DEBUG) console.info('токен успешно обновлен');
                if (DEBUG) console.info('повторная отправка запроса ' + GAME_SERVER + '/' + url);
                // Отправляем инициализацию повторно
                let response2 = await fetch(GAME_SERVER + '/' + url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': TOKEN_REPOSITORY.getAccessTokenWithType(tokenType),
                    },
                    mode: 'cors',
                    method: 'POST',
                    body: data
                });

                // Если снова не успешно, то сбрасываем все и отправляем на главную страницу
                if (!response2.ok) {
                    if (DEBUG) console.info('повторная отправка запроса не успешна');
                    if (DEBUG) console.log("response 2 status", response2.status);
                    if (!DEBUG) errorRedirect("/");

                } else {
                    if (DEBUG) console.info('-- end sendQuery --');
                    return await response2;
                }
            }
        } else if (!response1.ok) {
            if (DEBUG) console.info('отправка запроса не успешна');
            if (DEBUG) console.log("response 1 status", response1.status);
            if (!DEBUG) errorRedirect("/");

        }
        if (DEBUG) console.info('-- end sendQuery --');
        return await response1;

    } catch (error) {
        if (DEBUG) console.info('Общая ошибка');
        if (DEBUG) console.log("try catch!", error);
        if (!DEBUG) new bootstrap.Modal(document.getElementById('errorModal')).show();

    }
}
