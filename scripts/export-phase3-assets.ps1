$ErrorActionPreference = 'Stop'
# Extract original vector layers from the native Figma SVG export. No section screenshot is used by the site.
$doc = [xml](Get-Content -Raw "$PSScriptRoot/../scratch/phase3/figma-capital.svg")
$layers = $doc.DocumentElement.FirstChild.ChildNodes
$defs = $doc.DocumentElement.LastChild
$target = "$PSScriptRoot/../public/assets/capitar"
function Export-Layers($name, $bounds, $nodes) {
  $body = ($nodes | ForEach-Object {$_.OuterXml}) -join ''
  $needed = @{}
  $pending = $body
  do {
    $next = ''
    foreach ($match in [regex]::Matches($pending, '(?:url\(#|href="#)([^)"\s]+)')) {
      $id = $match.Groups[1].Value
      if (!$needed.ContainsKey($id)) {
        $node = $defs.SelectSingleNode(".//*[@id='$id']")
        if ($node) { $needed[$id] = $node.OuterXml; $next += $node.OuterXml }
      }
    }
    $pending = $next
  } while ($pending.Length)
  $size = $bounds -split ' '
  $svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" width="'+$size[2]+'" height="'+$size[3]+'" viewBox="'+$bounds+'">'+$body+'<defs>'+($needed.Values -join '')+'</defs></svg>'
  [IO.File]::WriteAllText("$target/$name.svg", $svg)
}
Export-Layers 'capital-background' '0 0 1441 950' @($layers[1],$layers[2],$layers[3],$layers[4])
$growth = $layers[9].ChildNodes
$dilution = $layers[10].ChildNodes
$momentum = $layers[11].ChildNodes
Export-Layers 'capital-growth-art' '88.5 411.188 398.667 174' @($growth[1],$growth[4],$growth[5],$growth[6],$growth[7])
Export-Layers 'capital-dilution-art' '614.659 422.188 318.504 163' @($dilution[4],$dilution[5],$dilution[6],$dilution[7])
Export-Layers 'capital-momentum-art' '952.833 313.188 425.667 373.62' @($momentum[2])
Export-Layers 'capital-runway-art' '400 638 480 204' @($layers[15..31])
Export-Layers 'capital-growth-icon' '427 330.188 42 42' @($growth[8..10])
Export-Layers 'capital-dilution-icon' '873.003 330.188 42 42' @($dilution[8..10])
Export-Layers 'capital-momentum-icon' '981.833 330 42 42' @($momentum[5..9])
Export-Layers 'capital-runway-icon' '88.5 623.955 42 42' @($layers[32..35])
Write-Output 'Extracted background, four icons and four original illustrations from Figma SVG.'
node "$PSScriptRoot/convert-phase3-assets.mjs"
if ($LASTEXITCODE -ne 0) { throw 'Artwork conversion failed.' }
