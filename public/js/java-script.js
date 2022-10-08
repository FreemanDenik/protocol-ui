function convertFormToJSON(form) {
    return JSON.stringify($(form)
        .serializeArray()
        .reduce(function (json, {name, value}) {
            json[name] = value;
            return json;
        }, {}));
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