document.querySelectorAll('a[href^="#"]').forEach(anchor=>{anchor.addEventListener('click',function(e){e.preventDefault();const target=document.querySelector(this.getAttribute('href'));if(target){const offsetTop=target.offsetTop-70;window.scrollTo({top:offsetTop,behavior:'smooth'})}})});window.addEventListener('scroll',function(){const navbar=document.getElementById('navbar');if(window.scrollY>50){navbar.style.background='rgba(255, 255, 255, 0.98)';navbar.style.boxShadow='0 2px 20px rgba(0,0,0,0.1)'}else{navbar.style.background='rgba(255, 255, 255, 0.95)';navbar.style.boxShadow='none'}});const observerOptions={threshold:0.1,rootMargin:'0px 0px -50px 0px'};const observer=new IntersectionObserver(function(entries){entries.forEach(entry=>{if(entry.isIntersecting){entry.target.style.opacity='1';entry.target.style.transform='translateY(0)'}})},observerOptions);document.querySelectorAll('section, .about-card, .project-card, .skill-category').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(30px)';el.style.transition='opacity 0.6s ease, transform 0.6s ease';observer.observe(el)});document.querySelector('.hero').style.opacity='1';document.querySelector('.hero').style.transform='translateY(0)';if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(registration=>{console.log('SW registered: ',registration)}).catch(registrationError=>{console.log('SW registration failed: ',registrationError)})})}
document.addEventListener('DOMContentLoaded',()=>{
  // Mobile navigation logic starts
  const navToggle=document.querySelector('.nav-toggle');
  const navList=document.querySelector('#nav-list');
  if (navToggle && navList) { // Add null checks for robustness
    navToggle.addEventListener('click',function(){
        navList.classList.toggle('nav-active');
        navToggle.classList.toggle('toggle-active')
    });
  }
  // Mobile navigation logic ends

  // AOS Initialization
  AOS.init({
    duration: 800, // values from 0 to 3000, with step 50ms
    easing: 'ease-in-out', // default easing for AOS animations
    once: true, // whether animation should happen only once - while scrolling down
    mirror: false, // whether elements should animate out while scrolling past them
    anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
  });

  const images=document.querySelectorAll('img[loading="lazy"]');
  if('IntersectionObserver' in window){
    const imageObserver=new IntersectionObserver((entries,observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img=entry.target;
          img.src=img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img)
        }
      })
    });
    images.forEach(img=>imageObserver.observe(img))
  }
})