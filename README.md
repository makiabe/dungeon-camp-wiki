# ダンジョンの入口でキャンプでもしようよ。攻略Wiki
ゲーム「ダンジョンの入口でキャンプでもしようよ。」の実マスターに基づく、画像付き静的攻略サイト。

## ローカルで確認
このフォルダで `python3 -m http.server 4180 --bind 127.0.0.1` を実行し、http://127.0.0.1:4180 を開きます。Node.js・外部CDN不要で閲覧できます。

## 構成
- `index.html`, `style.css`, `app.js`: サイト本体。URLのハッシュで個別ページに移動。
- `wiki-data.js`: ゲームから生成した公開用マスター。セーブデータ・ユーザー情報は含みません。
- `portraits.webp`: 134人の立ち絵を透過・余白調整した画像シート。
- `season_*.webp`: 年間24イベントの専用画像。
- `dungeon-*.webp`: ゲーム内ダンジョン背景。

## ゲーム更新時の同期
Node.jsとPython/Pillowが必要です。
```
node sync-data.mjs /path/to/DungeonCamp-iOS/dist
python3 sync-images.py /path/to/DungeonCamp-iOS/dist
```
`source-characters.json` は画像切り出しに使う同期中間データです。

## 掲載方針
未実装の素材名・採集階層・交換所・クラフトを作りません。攻略の提案は明記し、実測していない最強ランキングは掲載しません。季節イベント・曜日召喚・52週ピックアップはJSTの実設定で計算。緊急共闘は抽選なので「今週開催」と断定しません。

## 公開範囲
GitHub Pagesで攻略Wikiを公開しています。

https://makiabe.github.io/dungeon-camp-wiki/

`main` ブランチのルートを更新すると、公開サイトにも自動反映されます。

## 権利
ゲーム名・画像・ゲームデータの権利は各権利者に帰属します。素材の再配布ライセンスは付与していません。
