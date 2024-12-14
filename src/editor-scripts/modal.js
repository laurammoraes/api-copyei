export function closeModal() {
  event.target.closest(".edit-modal").style.display = "none";
}

export function addModalStyles() {
  const style = document.createElement("style");
  style.setAttribute("data-editor-element", "");
  style.innerHTML = `
        .edit-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999999999999 !important;
            color: #000;
        }

        .edit-modal form {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 500px;
            height: auto;
            transform: translate(-50%, -50%);
            background-color: #fff;
            padding: 12px;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .edit-modal .form-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }
        

        .edit-modal .form-header h3 {
            margin: 5px;
        }

        .edit-modal .form-header button {
            background-color: #fff;
            font-size: 1.1rem;
            color: darkgray;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            box-shadow: none;
            border: none;
        }

        .edit-modal .form-header button:hover {
            background-color: #c2c1c1;
            color: #fff;
        }

        .edit-modal .form-body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
        }

       .edit-modal .form-body div {
            width: 100%;
            margin-bottom: 12px;
        }

        .edit-modal .form-body div:last-child {
            margin-bottom: 0;
        }

        .edit-modal form div label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .edit-modal form div input {
            box-sizing: border-box;
            width: 100%;
            padding: 10px;
            height: 40px;
            border: 1px solid #ccc;
            border-radius: 5px;
            color: #000;
            margin: 0;
        }

        .edit-modal form div input[type="file"] {
            height: 45px;
        }
        
        .edit-modal .colors-inputs {
            display: flex;
            flex-direction: row;
            justify-content: center
        }

        .edit-modal .colors-inputs div {
            display: flex;
            align-items: center; 
            justify-content: center;
            flex-direction: column;
        }


        .edit-modal form div input[type="color"] {
            width: 40px;
            height: 40px;
            border: solid 1px #000000;
            margin: 5px;
            padding: 0;
            cursor: pointer;
            border-radius: 50%;
        }
        
        .edit-modal form .background-img-inputs span{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .edit-modal form .background-img-inputs p {
            font-size: 1.2rem;
        }
    
    
        .edit-modal .form-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
        }

        .edit-modal .form-footer button {
            text-align: center;
            margin: 0 5px;
            border: none;
            box-shadow: none;
            padding: 8px 10px;
            border-radius: 5px;
            cursor: pointer;
            height: 40px;
            width: 130px;
            font-weight: bold;
            color: #fff;
        }

        .edit-modal .form-footer button[type="submit"] {
            background-color: rgb(59, 59, 255);
        }

        .edit-modal .form-footer button[type="submit"]:hover {
            background-color: rgb(35, 35, 255);
        }

        .edit-modal .form-footer button[type="button"] {
            background-color: rgb(180, 180, 180);
        }

        .edit-modal .form-footer button[type="button"]:hover {
            background-color: rgb(134, 134, 134);
        }
        .edit-modal .form-footer button.button-delete {
            background-color: rgb(255, 59, 59);
        }
        .edit-modal .form-footer button.button-delete:hover {
            background-color: rgb(255, 35, 35);
        }

        .edit-modal .form-msg-error{
            display: none;
            align-items: center;
            justify-content: center;
            padding: 7px;
            background-color: rgb(255, 59, 59);
            border-radius: 5px;
            color: #fff;
            margin: 0 10px;
        }

        .whats-radio-group{
            display: flex;
            justify-content: left;
            align-items: left;
            margin-top: 10px;
            margin-left: 10px;
            width: 100px;
        }

        .whats-radio-group .whats-inputs-radio{
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .whats-radio-group .whats-inputs-radio input{
           width: 20px;
           height: 20px;
           margin: 0;
        }
        
        .whats-radio-group .whats-inputs-radio label{
          margin: 0 5px;
          font-size: 1rem;
          color: rgb(43, 43, 43);
        }
    `;

  document.head.appendChild(style);
}
