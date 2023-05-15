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
    console.log(target, event);
    $('#target h3#gold').text(target.gold)
    $('#target h3#reputation').text(target.reputation)
    $('#target h3#influence').text(target.influence)
    $('#target h3#luck').text(target.luck)
    $('#target h3#shadow').text(target.shadow)

    $('#question').text(event.eventText);
    $('#answers').empty();
    $.each(event.answers, function (e, i) {
        let b = $('<button/>', {
            text: i.answerText,
            'class': 'btn btn-primary',
            click: function () {
                sendAction(event.id, i.id);
            }
        })
        if(i.enabled === false)
            b.attr('disabled', true);
        $('#answers').append(b).append("<br/><br/>");
    })
}