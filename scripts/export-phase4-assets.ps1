$ErrorActionPreference='Stop'
# The source is the homepage's native SVG downloaded using Figma's browser Export control.
$doc=[xml](Get-Content -Raw "$PSScriptRoot/../scratch/phase4/figma-homepage.svg")
$layers=$doc.DocumentElement.FirstChild.ChildNodes
$defs=$doc.DocumentElement.LastChild
$target="$PSScriptRoot/../public/assets/capitar"
function Export-Layers($path,$bounds,$nodes) {
 $body=($nodes|ForEach-Object {$_.OuterXml}) -join ''
 $needed=@{}; $pending=$body
 do {
  $next=''
  foreach($m in [regex]::Matches($pending,'(?:url\(#|href="#)([^)"\s]+)')) {
   $id=$m.Groups[1].Value
   if(!$needed.ContainsKey($id)) {
    $n=$defs.SelectSingleNode(".//*[@id='$id']")
    if($n){$needed[$id]=$n.OuterXml;$next+=$n.OuterXml}
   }
  }
  $pending=$next
 } while($pending.Length)
 $size=$bounds -split ' '
 [IO.File]::WriteAllText($path,('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" width="'+$size[2]+'" height="'+$size[3]+'" viewBox="'+$bounds+'">'+$body+'<defs>'+($needed.Values -join '')+'</defs></svg>'))
}
$first=$layers[72].FirstChild.ChildNodes
Export-Layers "$target/difference-card-background.svg" '70 2904.99 366 440' @($first[0..4])
$cta=$layers[6].ChildNodes
Export-Layers "$target/difference-arrow.svg" '754.375 2897 14 10' @($cta[4],$cta[5])
for($i=0;$i -lt 4;$i++) {
 $card=$layers[72+$i].FirstChild
 $art=$card.ChildNodes|Where-Object { $_.LocalName -eq 'rect' -and $_.GetAttribute('fill') -like 'url(#pattern*' }
 $bounds=$art.x+' '+$art.y+' '+$art.width+' '+$art.height
 Export-Layers "$PSScriptRoot/../scratch/phase4/difference-art-$($i+1).svg" $bounds @($art)
}
Export-Layers "$PSScriptRoot/../scratch/phase4/figma-section.svg" '0 2435 1441 1672' @($layers[0..6]+$layers[72..75])
Write-Output 'Separated the original card background and four cube illustrations; headings and descriptions are excluded from website assets.'
