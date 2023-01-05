import bot from "./assets/bot.svg";
import send from "./assets/send.svg";
import user from "./assets/user.svg";

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');


let loadInterval

function loader(element){
  element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element , text){
  let index = 0;
  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }
    else{
      clearInterval(interval); //mtlb stop ho jao 
    }
  }, 20);
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId(){
  const  timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString =   randomNumber.toString(16);// here now we will get 16 random characters 

  return `id-${timestamp}-${hexadecimalString}`;

}

function chatStripe(isAi, value ,uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                <img 
                  src="${isAi ? bot : user}"
                  alt="${isAi ? 'bot' : 'user'}" 
                />
            </div>
            <div class="message" id=${uniqueId}>${value}</div>
        </div>
    </div>
`
)
}


//for getting the ai generated response 
const handleSubmit = async (e)  => {
  e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))// prompt is the message which we are writing on the screen from textarea 


    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    //fetch the data from the server  ---> bot's response 
    const response = await fetch('http://localhost:5000' ,{
      method:'POST',
      headers : {
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify({
        prompt : data.get('prompt') // this is the message which we are writing on the screen from textarea 

      })
    })
    clearInterval(loadInterval);
    messageDiv.innerHTML = ""; 

    if(response.ok){
      const data = await response.json();
      const parsedData = data.bot.trim();

      typeText(messageDiv , parsedData);
      
    }
    else{
      const err = await response.text();

      messageDiv.innerHTML = "Something went wrong ";
      
      alert(err);

    }



}


form.addEventListener('submit' , handleSubmit); 
// form.addEventListener('keyup' , (e) => {
//   if(e.keyCode === 13){
//     handleSubmit(e);
//   }
// });

