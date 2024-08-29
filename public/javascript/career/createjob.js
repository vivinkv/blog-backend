$("#responsibilities").summernote({
  placeholder: "Enter your responsibilities here...",
  tabsize: 2,
  height: "30vh",
});

$("#requirements").summernote({
  placeholder: "Enter your requirements here...",
  tabsize: 2,
  height: "30vh",
});
$("#benefits").summernote({
  placeholder: "Enter Section Content",
  tabsize: 2,
  height: "30vh",
});

document.getElementById("submitbtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const benefits = $("#benefits").summernote("code");
  const requirements = $("#requirements").summernote("code");
  const responsibilities = $("#responsibilities").summernote("code");
  const last_date = document.getElementById("last-date").value;

  console.log({
    title,
    description,
    benefits,
    requirements,
    responsibilities,
    last_date,
  });

  // Create a plain JavaScript object
  const data = {
    title,
    description,
    benefits,
    requirements,
    responsibilities,
    last_date,
  };

  console.log(data);

  // Send the data as JSON
  const response = await fetch(
    `${window.location.origin}/admin/career/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  console.log(result.err);

  if (!response.ok) {
    if (result.err) {
      console.log("yes");
      document.getElementById("titleError").style.display = "block";
      document.getElementById("titleError").innerHTML = `* ${result.err}`;
      return;
    }
  }

  document.getElementById("alertMessage").style.display = "block";
  setTimeout(() => {
    document.getElementById("alertMessage").style.display = "none";
    window.location.href = `${window.location.origin}/admin/career`;
  }, 2000);
});
