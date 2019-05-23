<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="wegwijs">
    <meta name="author" content="Martijn Groeneveldt">

    <title>wegwijs</title>

    <!-- Bootstrap core CSS -->
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
</head>

<body>
<div class="container">
    <div class="row">
        <?php for ($i = 1; $i < 23; $i++) { ?>
            <div class="col" id="roomtile">
                <div id="roomtilecurrent">
                    <u class="roomtitle">zaal <?php echo $i; ?></u>
                    <br/>
                    <span class="coursetitle">cursus met een lange naam</span>
                    <br/>
                    <span class="companytitle">bedrijf met een lange naam</span>
                    <br/>
                    <span class="bookedtime">00:00 - 00:00</span>
                </div>
                <div id="roomtilenext">
                    <span class="next-company">00:00 - volgend bedrijf</span>
                </div>
            </div>
        <?php } ?>
    </div>
</div>
<!-- Bootstrap core JavaScript -->
<script src="vendor/jquery/jquery.slim.min.js"></script>
<script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

</body>

</html>
<!--martijn.groeneveldt@gmail.com -->
