$p = Join-Path $PSScriptRoot "index.html"
$t = [IO.File]::ReadAllText($p, [Text.Encoding]::UTF8)
$pattern = '(?s)<div class="work__img" aria-hidden="true">\s*<img\s+class="work__imgPhoto"[^>]*/>\s*</div>'
$replacement = '<motion class="work__img work__img--empty" aria-hidden="true"></motion>'
$replacement = '<motion class="work__img work__img--empty" aria-hidden="true"></motion>'.Replace('<motion', '<div').Replace('</motion>', '</div>')
$t2 = [regex]::Replace($t, $pattern, $replacement)
$t2 = $t2.Replace('data-cms="work_arctic_tag">Заполярный • альбом • 4 фото', 'data-cms="work_arctic_tag">Заполярный • альбом')
$t2 = $t2.Replace('data-cms="work_women_tag">альбом • 3 фото', 'data-cms="work_women_tag">альбом')
$t2 = $t2.Replace('data-cms="work_men_tag">альбом • 3 фото', 'data-cms="work_men_tag">альбом')
$t2 = $t2.Replace('data-cms="work_kids_tag">альбом • 2 фото', 'data-cms="work_kids_tag">альбом')
$t2 = $t2.Replace('data-cms="work_family_tag">альбом • 2 фото', 'data-cms="work_family_tag">альбом')
$t2 = $t2.Replace('data-cms="work_btn">Смотреть альбом', 'data-cms="work_btn">Скоро')
[IO.File]::WriteAllText($p, $t2, [Text.UTF8Encoding]::new($false))
Write-Host "Done. Length delta:" ($t2.Length - $t.Length)
