const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {})

//Every Peer object is assigned a random, unique ID when it's created.
const myPeer = new Peer(undefined, {
  // youtubber cant use his own data for host, we commented it out
  // host: '/',
  // port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
// object being used to organize stuff in one place - referred to as a namespace
const peers = {}
// asking permission to get camera
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    //userID is connecting through stream to ...
    connectToNewUser(userId, stream)
  })
})
// ther seems to be one user ID for every peer
// very likely that peer is the stream, and user ID is user using that stream
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
// difference between peer and user? Circle back to this
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  // video call being initiated
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
// peer is being decleared (not a good practice)
  peers[userId] = call
}
// event listenever for when video stream begins
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}


// student will be in room alone after making request

// will provide ID to peer (no new one is needed)
// teacher will interract with peer and provide its id
// teacher will need its id to identify themsevles and student to complete request to peer
// teacher will initiate call using peer
// peer js library will make introduction (peerJS is not the same as peer)

// 2021-04-16
'use strict';
function readStudentIdFromURL() {
  var queryString = location.search;
  var urlSearchParameters = new URLSearchParams(queryString);
  return urlSearchParameters.get('student_id');
}
// Student code:
{
  var studentId = readStudentIdFromURL();
  const peer = new Peer(studentId);
  // wait for call...
}
/**
 * we'll need to do the same thing for the teacher, except remember that the
 * teacher needs *two* pieces of information. They need their own ID *and* the
 * ID of the student with whom they're about to start a call
 */
// Teacher code:
{
  // looks similar to start
  var teacherId = readTeacherIdFromURL();
  const peer = new Peer(teacherId);
  //but then:
  /**
   * (code to get mediaStream goes here)
   */
  // initiate call
  var studentId = readStudentIdFromURL();
  var call = peer.call(studentId, mediaStream);
}
/**
 * What we're calling the "student code" and the "teacher code" can go in the
 * same file. You just need to recognize which one you should use. One way you
 * could decide which one to use is to see if the teacher ID is present.
 *
 * Remember: we only need to give the teacher ID to the teacher. So if this
 * script ran for both the student and for the the teacher, then you could
 * decide which of the two examples above to run by seeing if the teacher ID
 * was present.
 */
// Don't forget to study the PeerJS documentation!
// https://peerjs.com/docs.html#peer
