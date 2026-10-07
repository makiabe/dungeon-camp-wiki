# ダンジョンの入口でキャンプでもしようよ。攻略Wiki
ゲーム「ダンジョンの入口でキャンプでもしようよ。」の実マスターに基づく、画像付き静的攻略サイト。

## 公開範囲
GitHub Pagesで攻略Wikiを公開しています。
https://makiabe.github.io/dungeon-camp-wiki/

## 軽量化した公開データ
`wiki-data.js` を元データとして残し、`node optimize-data.mjs` で初期表示用の `wiki-core.js` と `data/` の詳細データを生成します。依頼とイベント詳細は該当ページで一度だけ取得します。ゲームデータ同期時も自動生成します。

キャラ画像は `portraits/` の192px画像を遅延読み込みします。`sync-images.py` で画像シートと個別画像を同時生成します。JavaScript/CSS変更後は `node optimize-data.mjs` でキャッシュ識別子を更新してください。

検証: `node --test tests/performance.test.mjs`
