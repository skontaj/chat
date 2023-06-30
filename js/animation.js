var current = null;
document.querySelector('path').setAttribute('stroke-dasharray', '0 0');
document.querySelector('#username').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: 0,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '240 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
document.querySelector('#password').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: -348,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '227 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});

document.querySelector('#confirm_password').addEventListener('focus', function(e) {
  if (current) current.pause();
  current = anime({
    targets: 'path',
    strokeDashoffset: {
      value: -675,
      duration: 700,
      easing: 'easeOutQuart'
    },
    strokeDasharray: {
      value: '214 1386',
      duration: 700,
      easing: 'easeOutQuart'
    }
  });
});
