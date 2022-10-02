function convertFormToJSON(form) {
    return JSON.stringify($(form)
        .serializeArray()
        .reduce(function (json, {name, value}) {
            json[name] = value;
            return json;
        }, {}));
}

//Redirect при протухания всего или перезагрузки сервера
function errorRedirect(url) {
    localStorage.clear();
    window.location = url;
    return;
}
// Переустановка access токена
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
        return await fetch(GAME_SERVER + '/' + url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            mode: 'cors',
            method: 'POST',
            body: data
        });
    }catch (error){
        console.log(error.message, "error11");
        //errorRedirect("/");
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