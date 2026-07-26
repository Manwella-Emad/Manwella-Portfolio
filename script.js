const sections=document.querySelectorAll("section");

window.addEventListener("scroll",()=>{

sections.forEach(sec=>{

const top=window.scrollY;

const offset=sec.offsetTop-450;

if(top>offset){

sec.style.opacity=1;
sec.style.transform="translateY(0)";

}

});

});

sections.forEach(sec=>{

sec.style.opacity=0;

sec.style.transform="translateY(80px)";

sec.style.transition=".8s";

});
document.getElementById("year").textContent = new Date().getFullYear();