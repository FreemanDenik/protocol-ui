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
    isNull: function (){
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
        console.warn(GAME_SERVER);
        let response = await fetch(GAME_SERVER + '/' + url, {
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
        if (response.status === 403) {
            // Обновляем токен и сразу используем его в условии
            console.log('обновление токена')
            if (await tokenReset() === true) {
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
                    //errorRedirect("/");
                } else {
                    return await response2;
                }
            }
        } else if (!response.ok) {
            //errorRedirect("/");
        }
        return await response;

    } catch (error) {
        console.log("try catch!", error.status);
        //new bootstrap.Modal(document.getElementById('errorModal')).show();
    }
}
