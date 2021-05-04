'use strict';

$('.formubpadebtn').hide();
$('.ubdatebtn').on('click', function () {
    $('.formubpadebtn').toggle();
});

document.getElementById('updateBtn').addEventListener('click', function (event) {
    event.preventDefault();
});
