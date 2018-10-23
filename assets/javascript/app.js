var validUserData = true;
var errorMessage = "";

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAKN45koWKKv0ZR-8ioPHfk7suHU1RVMtM",
    authDomain: "train-time-schedule-a8788.firebaseapp.com",
    databaseURL: "https://train-time-schedule-a8788.firebaseio.com",
    projectId: "train-time-schedule-a8788",
    storageBucket: "train-time-schedule-a8788.appspot.com",
    messagingSenderId: "745238277439"
};
firebase.initializeApp(config);

//When adding a train, add it to the database
$("#add-train-btn").on("click", function (event) {
    event.preventDefault();

    //get the input values
    var trainName = $("#train-name-input").val().trim();
    if (!/./.test(trainName)) {
        errorMessage += " You need to input a train name.";
        validUserData = false;
    }

    var dest = $("#destination-input").val().trim();
    if (!/./.test(dest)) {
        errorMessage += " You need to input a train destination.";
        validUserData = false;
    }

    var first = $("#first-input").val().trim();
    console.log(first.length);
    if (first.length !== 5) {
        validUserData = false;
        errorMessage += " Your start time is incorrect.";
    }
    else if (!moment(first, "HH:mm").isValid()) {
        validUserData = false;
        errorMessage += " Your start time is incorrect.";
    }
    var freq = $("#frequency-input").val().trim();
    if ((/[^0-9]/.test(freq)) || (!/./.test(freq))) {
        validUserData = false;
        errorMessage += " Your frequency is not a number.";
    }

    if (validUserData) {
        //push the value to the firebase database
        firebase.database().ref().push({
            trainName: trainName,
            destination: dest,
            first: first,
            frequency: freq
        });
    }
    else {
        $("#errorMessage").text(errorMessage);
        $('#myModal').modal('show');
        errorMessage = "";
    }

    //clear input values
    $("#train-name-input").val("");
    $("#destination-input").val("");
    $("#first-input").val("");
    $("#frequency-input").val("");

});

// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update your page in real-time when the firebase database changes.
firebase.database().ref().on("child_added", function (snapshot) {

    //create a new row and the corresponding html
    var newRow = $("<tr>");
    var colName = $("<td scope='col'>").text(snapshot.val().trainName);
    newRow.append(colName);
    var colDest = $("<td scope='col'>").text(snapshot.val().destination);
    newRow.append(colDest);
    var colFreq = $("<td scope='col'>").text(snapshot.val().frequency);
    newRow.append(colFreq);

    //Perform calculations for the remaining rows
    // Get the frequency and the first train time
    var tFrequency = snapshot.val().frequency;

    // First time
    var firstTime = snapshot.val().first;

    // First Time (pushed back 1 day to make sure it comes before current time)
    var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "day");

    // Difference between the times
    var diffTime = moment().diff(firstTimeConverted, "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % tFrequency;

    // Minute Until Train
    var tMinutesTillTrain = tFrequency - tRemainder;

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    nextTrain = nextTrain.format("LT");

    var next = $("<td scope='col'>").text(nextTrain);
    newRow.append(next);
    var mins = $("<td scope='col'>").text(tMinutesTillTrain);
    newRow.append(mins);

    //add a button to delete a train, use the snapshot key as an attribute
    var button = $("<td scope='col'>");
    button.append($("<button class='btn float-left blue font-weight-bold' id='delete-train-btn'>").attr("key", snapshot.key).text("Delete"));
    newRow.append(button);

    //add the row to the table body
    $("tbody").append(newRow);

    // If any errors are experienced, log them to console.
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

//If a delete button is clicked, delete the value from the database and delete the row from the table.
$(document).on("click", "#delete-train-btn", function () {
    var key = $(this).attr("key");
    firebase.database().ref().child(key).remove();
    var row = $(this).parent().parent();
    row.remove();
});