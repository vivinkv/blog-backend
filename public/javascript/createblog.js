$(".summernote").summernote({
  placeholder: "Enter your description here...",
  tabsize: 2,
  height: "30vh",
});

$(".top_description_summernote").summernote({
  placeholder: "Enter Section Content",
  tabsize: 2,
  height: "30vh",
});
$(".bottom_description_summernote").summernote({
  placeholder: "Enter Section Content",
  tabsize: 2,
  height: "30vh",
});

document
  .getElementById("submitbtn")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    document.getElementById("titleError").style.display = "none";
    document.getElementById("bannerError").style.display = "none";
    document.getElementById("shortdescriptionError").style.display = "none";
    document.getElementById("contentError").style.display = "none";

    const title = document.getElementById("title").value;
    const bannerImg = document.getElementById("banner").files;
    const shortDescription = document.getElementById("shortdescription").value;
    const content = $("#summernote").summernote("code");
    const premium = document.getElementById("premium").checked;
    const is_published = document.getElementById("is_published").checked;
    const sections = Array.from(document.querySelectorAll(".section-item"));
    const sectionData = sections.map((section) => {
      const heading = section.querySelector('input[name="heading"]').value;
      const content = section.querySelector('textarea[name="content"]').value;
      return { heading, content };
    });
    const top_description = $(".top_description_summernote").summernote("code");
    const bottom_description = $(".bottom_description_summernote").summernote(
      "code"
    );
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", content);
    formData.append("short_description", shortDescription);
    formData.append("premium", premium);
    formData.append("is_published", is_published);
    formData.append("sections", JSON.stringify(sectionData));
    formData.append("top_description", top_description);
    formData.append("bottom_description", bottom_description);
    console.log(formData.getAll("sections"));
    for (let i = 0; i < bannerImg.length; i++) {
      formData.append("image", bannerImg[i]);
    }

    const response = await fetch(
      `${window.location.origin}/admin/dashboard/blogs/create`,
      {
        method: "POST",
        body: formData,
      }
    );
    console.log(response);
    const result = await response.json();
    console.log(result);
    console.log(result?.type);
    if (response?.ok) {
      // Show the alert message
      const alertMessage = document.getElementById("alertMessage");
      alertMessage.innerText = result.msg;
      alertMessage.style.display = "block";

      // Hide the alert after 3 seconds
      setTimeout(() => {
        alertMessage.style.display = "none";
        window.location.href = `${window.location.origin}/admin/dashboard/blogs`;
      }, 2000);
    }

    if (result?.type == "title") {
      document.getElementById("titleError").innerText = `* ${result?.err}`;
      document.getElementById("titleError").style.display = "block";
      return;
    } else if (result?.type == "banner") {
      document.getElementById("bannerError").innerText = `* ${result?.err}`;
      document.getElementById("bannerError").style.display = "block";
      return;
    } else if (result?.type == "short_description") {
      document.getElementById(
        "shortdescriptionError"
      ).innerText = `* ${result?.err}`;
      document.getElementById("short_descriptionError").style.display = "block";
      return;
    }
    if (result?.err) {
      document.getElementById("contentError").innerText = `* ${result?.err}`;
      document.getElementById("contentError").style.display = "block";
      return;
    }
  });
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("toggle-button");
  const body = document.body; // Get the body element
  let isSidebarVisible = false;

  function showSidebar() {
    sidebar.style.transform = "translateX(0%)";
    toggleButton.style.display = "none"; // Hide button when sidebar is visible
    body.classList.add("sidebar-visible");
    isSidebarVisible = true;
  }

  function hideSidebar() {
    sidebar.style.transform = "translateX(-100%)";
    toggleButton.style.display = "block"; // Show button when sidebar is hidden
    body.classList.remove("sidebar-visible");
    isSidebarVisible = false;
  }

  toggleButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click event from bubbling up
    if (isSidebarVisible) {
      hideSidebar();
    } else {
      showSidebar();
    }
  });

  // Hide sidebar when clicking outside of it
  document.addEventListener("click", (e) => {
    if (
      isSidebarVisible &&
      !sidebar.contains(e.target) &&
      !toggleButton.contains(e.target)
    ) {
      hideSidebar();
    }
  });

  // Stop propagation when clicking inside the sidebar to prevent it from closing
  sidebar.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

//   add new sections

document.addEventListener("DOMContentLoaded", function () {
  const formSections = document.getElementById("formSections");

  // Function to add a new section
  function addNewSection() {
    const newSection = document.createElement("div");
    newSection.classList.add("section-item");

    newSection.innerHTML = `
            <div class="header">
                 <button type="button" id="" class="add-btn addSection"><img src="/add.png" width="30" height="30" alt="add"></button>
                 <button type="button" id="" class="delete-btn deleteSection"><img src="/delete.svg" width="30" height="30" alt="delete"></button>
            </div>
            <div class="section" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
               <input
                  type="text"
                  name="heading"
                  class="form-input"
                  placeholder="Title"
                />
                <textarea
                  name="content"
                  class="form-textarea summernote-section"
                  placeholder="Message"
                ></textarea>
            </div>
        `;

    formSections.appendChild(newSection);

    // Reattach event listeners to the new "+" and "-" buttons
    attachAddSectionListener(newSection.querySelector(".addSection"));
    attachDeleteSectionListener(newSection.querySelector(".deleteSection"));
  }

  // Function to attach event listener to "+" buttons
  function attachAddSectionListener(button) {
    button.addEventListener("click", addNewSection);
    $(".summernote-section").summernote({
      placeholder: "Enter Section here...",
      tabsize: 2,
      height: "30vh",
    });
  }

  // Function to attach event listener to "-" buttons
  function attachDeleteSectionListener(button) {
    button.addEventListener("click", function () {
      document.getElementById("delete-confirmation-modal").style.display =
        "flex";
    });
  }

  document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("delete-confirmation-modal").style.display = "none";
  });
  document.getElementById("confirm-delete").addEventListener("click", () => {
    document.getElementById("delete-confirmation-modal").style.display = "none";
    document.querySelector(".deleteSection").closest(".section-item").remove();
  });

  // Attach listener to the initial "+" and "-" buttons
  attachAddSectionListener(document.querySelector(".addSection"));
  attachDeleteSectionListener(document.querySelector(".deleteSection"));
});