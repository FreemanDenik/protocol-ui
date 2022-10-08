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
    let target = json.first;
    let event = json.second;
    $('#target h3#gold').text(target.gold)
    $('#target h3#reputation').text(target.reputation)
    $('#target h3#health').text(target.health)
    $('#target h3#thirst').text(target.thirst)
    $('#target h3#fight').text(target.fight)
    $('#target h3#shadow').text(target.shadow)

    $('#question').text(event.question);
    $('#answers').empty();
    $.each(event.answers, function (e, i) {
        $('#answers').append(
            $('<button/>', {
                text: i.text,
                'class': 'btn btn-primary',
                click: function () {
                    sendAction(event.id, i.id);
                }

            })
        ).append("<br/><br/>");
    })
}