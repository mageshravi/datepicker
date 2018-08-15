# Release notes

## v0.1.5 beta

- Fixes the bug that caused the default values "today" and "tomorrow" to be NOT translated to their respective date/datetime formats.

```html
<!-- input -->
<input type="text" class="datepicker" name="today" value="today">
<!-- datepicker transformation -->
<input type="hidden" class="datepicker" name="today" value="2018-08-15">

<!-- input with datetime format -->
<input type="text" class="datepicker" name="tomorrow" data-format="datetime" value="tomorrow">
<!-- datepicker transformation -->
<input type="hidden" class="datepicker" name="tomorrow" data-format="datetime" value="2018-08-16 16:10:20">

```

## v0.1.2 beta

- New value keyword **_yesterday_**
- New attribute **_data-max-date_**

See _index.html_ for usage examples.

## v0.1.1 beta

- Populates time dropdown for the given value.
- Fixes a bug that caused 12 pm to be displayed as 12 am.
- Fixes a bug that caused forms using datepicker to be submitted on clicking the 'Go' button.
