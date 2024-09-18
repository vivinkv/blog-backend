const storeImageOnServer = require("./storeImagetoServer");
const path=require('path')
const regex = /http:\/\/www\.thehappyhomes\.com\/attachments\/Resources\/([^\s]+)\.(png|jpg|jpeg|gif)/g;
const replaceURL=(description)=> {
  // Check if the description is an array
  if (Array.isArray(description)) {
    // Iterate over each element in the array and apply the replacement
    return description.map(desc =>
      desc.replace(regex, (match, filePath, ext) => {
        storeImageOnServer(`http://www.thehappyhomes.com/attachments/Resources/${filePath}.${ext}`,path.join( "",
          "uploads",
          "attachments",
          "resources",
          `${filePath}.${ext}`
        ))
        console.log(`File:${filePath}.${ext}`);
        return `https://blogs-23vc.onrender.com/uploads/attachments/resources/${filePath}.${ext}`;
      })
    );
  } else if (typeof description === "string") {
    // If it's a string with multiple URLs, apply the replacement globally
    return description.replace(regex, (match, filePath, ext) => {
      storeImageOnServer(`http://www.thehappyhomes.com/attachments/Resources/${filePath}.${ext}`,path.join( "",
        "uploads",
        "attachments",
        "resources",
        `${filePath}.${ext}`
      ))
      return `https://blogs-23vc.onrender.com/uploads/attachments/resources/${filePath}.${ext}`;
    });
  } else {
    // If it's neither a string nor an array, return it as-is (or handle accordingly)
    return description;
  }
}

module.exports=replaceURL