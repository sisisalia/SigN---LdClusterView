JSONJSONLint - The JSON Validator
More Developer Tools
Try the New Pro


44
    ["chr19:54544177:C:T", "chr19:54550830:C:T", 0.00478862],
45
    ["chr19:54544177:C:T", "chr19:54550848:G:A", 0.00478862],
46
    ["chr19:54544177:C:T", "chr19:54551098:A:G", 0.00480232],
47
    ["chr19:54544177:C:T", "chr19:54551115:G:T", 0.0291068],
48
    ["chr19:54544177:C:T", "chr19:54551117:T:C", 0.0291068],
49
    ["chr19:54544177:C:T", "chr19:54551282:G:A", 0.02541],
50
    ["chr19:54544177:C:T", "chr19:54551401:G:A", 0.00967207],
51
    ["chr19:54544177:C:T", "chr19:54551527:G:A", 0.0128956],
52
    ["chr19:54544177:C:T", "chr19:54551578:C:T", 0.00480232],
53
    ["chr19:54544177:C:T", "chr19:54551888:T:C", 0.00478862],
54
    ["chr19:54544177:C:T", "chr19:54552005:G:A", 0.00480232],
55
    ["chr19:54544177:C:T", "chr19:54552080:G:C", 0.0291068],
56
    ["chr19:54544177:C:T", "chr19:54552595:G:A", 0.00478862],
57
    ["chr19:54544177:C:T", "chr19:54552765:T:C", 0.00478862],
58
    ["chr19:54544177:C:T", "chr19:54552864:C:T", 0.00478862],
59
    ["chr19:54544177:C:T", "chr19:54553242:T:A", 0.00478862],
60
    ["chr19:54544177:C:T", "chr19:54553604:G:A", 0.0128956],
61
    ["chr19:54544177:C:T", "chr19:54553697:T:C", 0.0291068],
62
    ["chr19:54544177:C:T", "chr19:54553764:T:G", 0.0255666],
63
    ["chr19:54544177:C:T", "chr19:54553956:G:A", 0.02541],
64
    ["chr19:54544177:C:T", "chr19:54553964:T:C", 0.00478862],
65
    ["chr19:54544177:C:T", "chr19:54554071:T:A", 0.087804],
66
    ["chr19:54544177:C:T", "chr19:54554100:G:A", 0.00478862],
67
    ["chr19:54544177:C:T", "chr19:54554146:C:T", 0.0255666],
68
    ["chr19:54544177:C:T", "chr19:54554219:C:T", 0.00478862],
69
    ["chr19:54544177:C:T", "chr19:54554380:T:C", 0.0128956],
70
    ["chr19:54544177:C:T", "chr19:54554438:C:T", 0.00478862],
71
    ["chr19:54544177:C:T", "chr19:54554942:C:A", 0.182758],
72
    ["chr19:54544177:C:T", "chr19:54554950:C:T", 0.043528],
73
    ["chr19:54544177:C:T", "chr19:54555108:G:A", 0.218569],
74
    ["chr19:54544177:C:T", "chr19:54555373:C:A", 0.00478862],
75
    ["chr19:54544177:C:T", "chr19:54555378:C:T", 0.0248673],
76
    ["chr19:54544177:C:T", "chr19:54555380:C:T", 0.0087714],
77
    ["chr19:54544177:C:T", "chr19:54555381:A:G", 0.156124],
78
    ["chr19:54544177:C:T", "chr19:54555394:T:G", 0.00478862],
79
    ["chr19:54544177:C:T", "chr19:54555468:T:C", 0.189493],
80
    ["chr19:54544177:C:T", "chr19:54555496:C:T", 0.000209805],
81
    ["chr19:54544177:C:T", "chr19:54555513:G:C", 0.0696213],
82
    ["chr19:54544177:C:T", "chr19:54555525:C:A", 0.0830667],
83
    ["chr19:54544177:C:T", "chr19:54555557:C:G", 0.00274717],
84
    ["chr19:54544177:C:T", "chr19:54555577:G:C", 0.00441711],
85
    ["chr19:54544177:C:T", "chr19:54555609:G:A", 0.152317],
Validate JSON  Clear Support JSONLint for $2/Month
Results

Error: Parse error on line 1:
var data = [	["chr1
^
Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE', 'FALSE', '{', '[', got 'undefined'
JSONLint Partners
Check out their products!

Slack
It's teamwork, but simpler, more pleasant and more productive.

Manual Kinks in your CI/CD Pipeline?
Is Your DevOps Pipeline Leaking?
About JSONLint?
JSONLint is a validator and reformatter for JSON, a lightweight data-interchange format. Copy and paste, directly type, or input a URL in the editor above and let JSONLint tidy and validate your messy JSON code.
Tips & Tricks
You can directly input a URL into the editor and JSONLint will scrape it for JSON and parse it.
You can provide JSON to lint in the URL if you link to JSONLint with the "json" parameter. Here's an example URL to test.
JSONLint can also be used as a JSON compressor if you add ?reformat=compress to the URL.
Common Errors
Expecting 'STRING' - You probably have an extra comma at the end of your collection. Something like { "a": "b", }
Expecting 'STRING', 'NUMBER', 'NULL', 'TRUE', 'FALSE', '{', '[' - You probably have an extra comma at the end of your list. Something like: ["a", "b", ]
Enclosing your collection keys in quotes. Proper format for a collection is { "key": "value" }
Make sure you follow JSON's syntax properly. For example, always use double quotes, always quotify your keys, and remove all callback functions.
Different Results
If you use a Windows computer you may end up with different results. This is possibly due to the way Windows handles newlines. Essentially, if you have just newline characters (\n) in your JSON and paste it into JSONLint from a Windows computer, it may validate it as valid erroneously since Windows may need a carriage return (\r) as well to detect newlines properly. As a solution, either use direct URL input, or make sure your content's newlines match the architecture your system expects!
Credits
Maintained by Andrey Gubanov. Thanks to Douglas Crockford of JSON and JS Lint, and Zach Carter, who built a pure JavaScript implementation. You can download the JSONLint source code on GitHub.


© 2017 JSONLint.com — Advertise Here
