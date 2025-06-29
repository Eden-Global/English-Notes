document.addEventListener('DOMContentLoaded',()=>{const e=document.getElementById("name-selection-screen"),
t=document.getElementById("avatar-selection-screen"),n=document.getElementById("name-form"),
o=document.querySelector(".name-input");n.addEventListener("submit",n=>{n.preventDefault(),
o.value.trim()?(e.classList.add("hidden"),t.classList.remove("hidden")):alert("Please enter your name.")});
document.querySelectorAll('.avatar-option').forEach(avatar=>{avatar.addEventListener('click',()=>{
const classLevel=avatar.getAttribute('data-class');setTimeout(()=>{
window.location.href=`notes-${classLevel}.html`},1000)})})});