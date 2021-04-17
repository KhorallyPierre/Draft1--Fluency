// var thumbUp = document.getElementsByClassName("fa-thumbs-up");
// var thumbDown = document.getElementsByClassName("fa-thumbs-down");
var trash = document.getElementsByClassName("fa-trash");
let language = document.getElementsByClassName("language");


//
// Array.from(thumbUp).forEach(function(element) {
//   element.addEventListener('click', function() {
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     fetch('messages', {
//         method: 'put',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           'name': name,
//           'msg': msg,
//           'thumbUp': thumbUp
//         })
//       })
//       .then(response => {
//         if (response.ok) return response.json()
//       })
//       .then(data => {
//         console.log(data)
//         window.location.reload(true)
//       })
//   });
// });
// Array.from(thumbDown).forEach(function(element) {
//   element.addEventListener('click', function() {
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     fetch('messages/down', {
//         method: 'put',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           'name': name,
//           'msg': msg,
//           'thumbUp': thumbUp
//         })
//       })
//       .then(response => {
//         if (response.ok) return response.json()
//       })
//       .then(data => {
//         console.log(data)
//         window.location.reload(true)
//       })
//   });
// });

Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function() {
    const name = this.parentNode.parentNode.childNodes[1].innerText
    const msg = this.parentNode.parentNode.childNodes[3].innerText
    fetch('messages', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'name': name,
        'msg': msg
      })
    }).then(function(response) {
      window.location.reload()
    })
  });
});


var chat = document.getElementsByClassName('connectToChat');

console.log(chat)
Array.from(chat).forEach(function(element) {
  element.addEventListener('click', function() {
    console.log('you clicked to chat', element.id)
    // call fetch to that pair API
    // pair API should match you with someone to talk to
    const url= '/pair?' + 'learning=' + element.id
    fetch(url)
      .then(response => response.json())
      .then(data => {

        window.location = '/profile'


        console.log(data)});


  })
});

// let chatForm = document.querySelectorAll('.searchChat');
// chatForm.addEventListener('submit', searchChat);
// function searchChat(e) {
//   e.preventDefault();
//   const learning = e.target.childNodes[1].getAttribute('id');
//   console.log('GOODBYE')
//   console.log(e.target.childNodes[1].getAttribute('id'));
//   fetch('/pair', {
//     method: 'post',
//     headers: {'Content-Type' : 'application/json'},
//     body: JSON.stringify({ learning: learning })
//   }).then( () => {window.location.reload(); })
// }
