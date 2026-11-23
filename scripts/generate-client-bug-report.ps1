$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot "CLIENT_BUG_RESOLUTION_REPORT.md"
$outputPath = Join-Path $projectRoot "AKM-Public-School-Bug-Resolution-Report.docx"
$tempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("akm-report-" + [guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Path $tempPath | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempPath "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempPath "word") | Out-Null

function Escape-Xml([string]$value) {
    return [System.Security.SecurityElement]::Escape($value)
}

function Paragraph-Xml([string]$text, [string]$style = "Normal") {
    $escaped = Escape-Xml $text
    $styleXml = if ($style -ne "Normal") { "<w:pPr><w:pStyle w:val=`"$style`"/></w:pPr>" } else { "" }
    return "<w:p>$styleXml<w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>"
}

$paragraphs = New-Object System.Collections.Generic.List[string]
foreach ($line in Get-Content -LiteralPath $sourcePath -Encoding UTF8) {
    if ([string]::IsNullOrWhiteSpace($line)) {
        $paragraphs.Add("<w:p/>")
    } elseif ($line.StartsWith("### ")) {
        $paragraphs.Add((Paragraph-Xml $line.Substring(4) "Heading3"))
    } elseif ($line.StartsWith("## ")) {
        $paragraphs.Add((Paragraph-Xml $line.Substring(3) "Heading2"))
    } elseif ($line.StartsWith("# ")) {
        $paragraphs.Add((Paragraph-Xml $line.Substring(2) "Title"))
    } elseif ($line.StartsWith("- ")) {
        $paragraphs.Add((Paragraph-Xml ("• " + $line.Substring(2))))
    } else {
        $clean = $line -replace '\*\*', '' -replace '  $', ''
        $paragraphs.Add((Paragraph-Xml $clean))
    }
}

$contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
$relationships = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$documentRelationships = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
$styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:color w:val="173A7A"/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:color w:val="173A7A"/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:color w:val="244A8F"/><w:sz w:val="24"/></w:rPr></w:style></w:styles>'
$body = [string]::Join("", $paragraphs)
$document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + $body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>'

[System.IO.File]::WriteAllText((Join-Path $tempPath "[Content_Types].xml"), $contentTypes, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempPath "_rels\.rels"), $relationships, [System.Text.UTF8Encoding]::new($false))
New-Item -ItemType Directory -Path (Join-Path $tempPath "word\_rels") | Out-Null
[System.IO.File]::WriteAllText((Join-Path $tempPath "word\_rels\document.xml.rels"), $documentRelationships, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempPath "word\styles.xml"), $styles, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText((Join-Path $tempPath "word\document.xml"), $document, [System.Text.UTF8Encoding]::new($false))

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath
}
$archive = [System.IO.Compression.ZipFile]::Open($outputPath, [System.IO.Compression.ZipArchiveMode]::Create)
$packageFiles = @(
    @{ Source = "[Content_Types].xml"; Entry = "[Content_Types].xml" },
    @{ Source = "_rels\.rels"; Entry = "_rels/.rels" },
    @{ Source = "word\document.xml"; Entry = "word/document.xml" },
    @{ Source = "word\styles.xml"; Entry = "word/styles.xml" },
    @{ Source = "word\_rels\document.xml.rels"; Entry = "word/_rels/document.xml.rels" }
)
foreach ($packageFile in $packageFiles) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        (Join-Path $tempPath $packageFile.Source),
        $packageFile.Entry,
        [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
}
$archive.Dispose()
Remove-Item -LiteralPath $tempPath -Recurse

Write-Output $outputPath
