export const brickProcessorMixin = {
    methods: {
        CleanItemId(itemId) {
            var lastChar = itemId.substr(-1, 1);
            if (lastChar >= 'a' && lastChar <= 'h') {
                return itemId.slice(0, -1);
            } else {
                return itemId;
            }
        },
        FindColor(brickLinkColorId, colorList) {
            var result = colorList.filter(
                (color) => color.brickLinkId == brickLinkColorId
            );
            return result[0];
        },
        FindBrick(item, bricks) {
            //console.log("satFind", item, bricks);
            if (!bricks) return null;
            bricks = bricks.filter((brick) => !brick.isSoldOut);
            var result = bricks.filter(
                (brick) =>
                    brick.colorFamily == item.color.piecesAndBricksName &&
                    !brick.isSoldOut
            );
            //console.log("result", result);

            if (this.IsSpecialBrick(item)) {
                if (!result.length) {
                    var colorCodesArray = item.brickLink.mapPCCs;
                    var colorCodes = colorCodesArray[
                        item.color.brickLinkId
                    ].split(',');

                    result = bricks.filter(function(brick) {
                        return this.indexOf(brick.itemNumber) < 0;
                    }, colorCodes);
                    //console.log("result 2", result);
                }
            }

            result.sort((a, b) => {
                if (a.price.amount > b.price.amount) {
                    return 1;
                } else {
                    return -1;
                }
            });
            return result[0];
        },
        FindBrickPickABrick(item, bricks) {
            //console.log("pickABrickFind", item, bricks);
            if (!bricks) return null;

            var result = bricks.filter(
                (brick) =>
                    brick.variant.attributes.colour == item.color.pickABrickName
            );

            if (this.IsSpecialBrick(item)) {
                if (!result.length) {
                    var colorCodesArray = item.brickLink.mapPCCs;
                    var colorCodes = colorCodesArray[
                        item.color.brickLinkId
                    ].split(',');
                    //console.log("result", result);

                    result = bricks.filter(function(brick) {
                        return this.indexOf(brick.itemNumber) < 0;
                    }, colorCodes);
                    //console.log("result 2", result);
                }
            }

            return result[0];
        },
        IsSpecialBrick(item) {
            if (
                ~item.itemid.indexOf('pb') ||
                ~item.itemid.indexOf('c') ||
                item.color.brickLinkId == 65
            ) {
                return true;
            }
            return false;
        },
    },
};
