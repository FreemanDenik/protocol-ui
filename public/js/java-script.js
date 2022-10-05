function convertFormToJSON(form) {
    return JSON.stringify($(form)
        .serializeArray()
        .reduce(function (json, {name, value}) {
            json[name] = value;
            return json;
        }, {}));
}

// очищаем локальное хранилище и redirect на указанный url
function errorRedirect(url) {
    localStorage.clear();
    window.location = url;
    return;
}
// Переустановка access токена (короткоживущего)
async function tokenReset() {
    try {
        let response = await sendQuery('api/auth/token', null, '{"refreshToken":"' + TOKEN_INFO.refreshToken + '"}');
        let json = await response.json();
        TOKEN_INFO.accessToken = json.accessToken;
        localStorage.setItem("token", JSON.stringify(TOKEN_INFO));
        return true;
    } catch (error) {
        return false;
    }
}
// Отправка запроса
async function sendQuery(url, tokenType, data) {
    try {
        let token = null;
        switch (tokenType) {
            case "access":
                token = TOKEN_INFO.type + ' ' + TOKEN_INFO.accessToken;
                break;
            case "refresh":
                token = TOKEN_INFO.type + ' ' + TOKEN_INFO.refreshToken;
                break;
        }
        let response = await fetch(GAME_SERVER + '/' + url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            mode: 'cors',
            method: 'POST',
            body: data
        });
        // Если при перезагрузке страницы, ответ 403 авторизация не успешна,
        // скорее всего протух access токен (он короткоживущий)
        if (response.status === 403) {
            // Обновляем токен и сразу используем его в условии
            if (await tokenReset() === true) {
                // Отправляем инициализацию повторно
                response = await sendQuery(url, tokenType, data);
                // Если снова не успешно, то сбрасываем все и отправляем на главную страницу
                if (!response.ok) {
                    errorRedirect("/");
                }
            }
        }
        return await response;

    }catch (error){
        console.log("try catch!");
        new bootstrap.Modal(document.getElementById('errorModal')).show();
    }
}
// Отрисовка данных игры
function printGameInfo(json) {
    $('#target h3#gold').text(json.first.gold)
    $('#target h3#reputation').text(json.first.reputation)
    $('#target h3#health').text(json.first.health)
    $('#target h3#thirst').text(json.first.thirst)
    $('#target h3#fight').text(json.first.fight)
    $('#target h3#shadow').text(json.first.shadow)

    $('#question').text(json.second.question);
    $('#answers').empty();
    $.each(json.second.answers, function (e, i) {
        $('#answers').append(
            $('<button/>', {
                text: i.text,
                'class': 'btn btn-primary',
                click: function () {
                    sendAction(json.second.id, i.id);
                }

            })
        ).append("<br/><br/>");
    })
}