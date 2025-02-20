<template>
    <b-container fluid="xl" class="bricksContainer">
        <b-row class="p-1">
            <b-col class="mr-1">
                <b-input-group variant="primary">
                    <b-input-group-prepend is-text>
                        <b-icon icon="search" />
                    </b-input-group-prepend>
                    <b-form-input
                        v-model="keyword"
                        @update="onKeywordChange"
                        type="search"
                        debounce="500"
                        :placeholder="labelFindPartsByKeyword"
                    >
                    </b-form-input>
                </b-input-group>
            </b-col>
            <b-col class="ml-1">
                <b-container class="p-0">
                    <b-row class="m-0">
                        <b-col>
                            <SortFilter
                                @selectSortBy="onSelectSortByChange"
                                @selectSortDirection="
                                    onSelectSortDirectionChange
                                "
                                :selectedSort="selectedSort"
                                :sortDirection="sortDirection"
                            />
                        </b-col>
                        <b-col class="ml-1 p-0" cols="auto">
                            <b-button
                                class="button m-0"
                                variant="primary"
                                @click="$bvModal.show('settings')"
                            >
                                <b-icon icon="gear" aria-hidden="true" />
                            </b-button>
                        </b-col> </b-row
                ></b-container>
            </b-col>
        </b-row>
        <b-row>
            <ColorPicker @selectColor="onColorChange" :colorList="colorList" />
        </b-row>
        <b-row class="p-1">
            <b-col>
                <b-form-select
                    style="width:75px"
                    v-model="perPage"
                    :options="perPageOptions"
                    @change="onChangePerPage"
                />
            </b-col>
            <b-col class="center">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    @change="onChangeCurrentPage"
                    limit="9"
                    aria-controls="my-table"
                    last-number
                />
            </b-col>
            <b-col class="text-right">
                <b-button
                    v-if="showAs != 'grid'"
                    class="button m-0"
                    variant="primary"
                    @click="showAs = 'grid'"
                >
                    <b-icon icon="grid" aria-hidden="true" />
                </b-button>
                <b-button
                    v-if="showAs != 'list'"
                    class="button m-0"
                    variant="primary"
                    @click="showAs = 'list'"
                >
                    <b-icon icon="list-stars" aria-hidden="true" />
                </b-button>
            </b-col>
        </b-row>
        <b-overlay
            id="overlay-background"
            :show="listUpdate"
            rounded="sm"
            style="margin: 0 -15px; padding: 0 15px;"
        >
            <b-row
                v-if="showAs == 'grid'"
                cols="12"
                style="min-height: 50px;"
                :key="componentKey"
            >
                <BrickGrid
                    v-for="brick in search.bricks"
                    :key="brick.itemNumber"
                    :brick="brick"
                    @addToPartList="addToPartList"
                    @setKeyword="setKeyword"
                    @setColor="setColor"
                    @setOrderQuantity="setOrderQuantity"
                />
            </b-row>
            <b-row v-if="showAs == 'list'" cols="12" :key="componentKey">
                <BrickList
                    v-for="brick in search.bricks"
                    :key="brick.itemNumber"
                    :brick="brick"
                    @addToPartList="addToPartList"
                    @setKeyword="setKeyword"
                    @setColor="setColor"
                    @setOrderQuantity="setOrderQuantity"
                />
            </b-row>
        </b-overlay>
        <b-row class="p-1">
            <b-col>
                <b-form-select
                    style="width:75px"
                    v-model="perPage"
                    :options="perPageOptions"
                    @change="onChangePerPage"
                />
            </b-col>
            <b-col class="center">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    @change="onChangeCurrentPage"
                    limit="9"
                    aria-controls="my-table"
                    last-number
                />
            </b-col>
            <b-col class="text-right">
                <b-button
                    v-if="showAs != 'grid'"
                    class="button m-0"
                    variant="primary"
                    @click="showAs = 'grid'"
                >
                    <b-icon icon="grid" aria-hidden="true" />
                </b-button>
                <b-button
                    v-if="showAs != 'list'"
                    class="button m-0"
                    variant="primary"
                    @click="showAs = 'list'"
                >
                    <b-icon icon="list-stars" aria-hidden="true" />
                </b-button>
            </b-col>
        </b-row>
        <b-modal
            id="settings"
            :title="labelSettingsHeader"
            :header-bg-variant="headerBgVariant"
            :header-text-variant="headerTextVariant"
            centered
            hide-header-close
            no-close-on-backdrop
            no-close-on-esc
            @ok="okSettings"
            @cancel="cancleSettings"
        >
            <p class="my-4">
                <b-form-checkbox
                    v-model="tempShowOnlyAvailable"
                    id="showOnlyAvailable"
                    name="showOnlyAvailable"
                >
                    {{ labelShowOnlyAvailable }}
                </b-form-checkbox>
            </p>
            <p class="my-4">
                <b-form-group v-slot="{ ariaDescribedby }">
                    <b-form-checkbox
                        v-model="tempSelectCategoriesToBeHidden"
                        id="selectCategoriesToBeHidden"
                        name="selectCategoriesToBeHidden"
                    >
                        {{ labelSelectCategoriesToBeHidden }}
                    </b-form-checkbox>
                    <b-overlay
                        id="overlay-background"
                        :show="!categorieOptions"
                        rounded="sm"
                    >
                        <div
                            style="overflow: hidden scroll; height: 200px; background-color: #eee; padding: 5px"
                        >
                            <b-form-checkbox
                                v-for="option in categorieOptions"
                                v-model="tempExcludedCategories"
                                :key="option.value"
                                :value="option.value"
                                :aria-describedby="ariaDescribedby"
                                name="excludeCategorie"
                            >
                                {{ option.text }}
                            </b-form-checkbox>
                        </div>
                    </b-overlay>
                </b-form-group>
            </p>
        </b-modal>
    </b-container>
</template>

<script>
import { brickColorMixin } from '@/mixins/brickColorMixin';
import BrickGrid from './BrickGrid';
import BrickList from './BrickList';
import ColorPicker from './filter/ColorPicker';
import SortFilter from './filter/Sort';
import { bus } from '@/utility/bus';
import apiBrickTwo from '@/utility/api/bricktwo.js';

export default {
    props: {
        favoriteSelected: {
            type: Boolean,
        },
        haveItSelected: {
            type: Boolean,
        },
    },
    data: () => ({
        perPage: 24,
        perPageOptions: [
            { value: 8, text: '8' },
            { value: 24, text: '24' },
            { value: 48, text: '48' },
            { value: 100, text: '100' },
        ],
        currentPage: 1,
        totalRows: 0,
        group: false,
        keyword: null,
        selectedSort: 'DESCRIPTION',
        sortDirection: 'ASC',
        selectedColor: 'all',
        search: [],
        showAs: 'grid',
        listUpdate: true,
        componentKey: 0,
        colorList: [],
        headerBgVariant: 'dark',
        headerTextVariant: 'light',
        tempShowOnlyAvailable: true,
        showOnlyAvailable: true,
        selectedItemNumbers: null,
        selectedDesignIds: null,
        currentPageChanged: 0,
        perPageChange: 0,
        categoryId: 0,
        selectPartListId: '',
        showPartListId: '',
        showFavorites: false,
        showHaveIts: false,
        shotNotifications: false,
        categories: null,
        tempExcludedCategories: [],
        excludedCategories: [],
        categorieOptions: null,
        tempSelectCategoriesToBeHidden: true,
        selectCategoriesToBeHidden: true,
        currentFilter: [],
    }),
    components: {
        BrickGrid,
        BrickList,
        ColorPicker,
        SortFilter,
    },
    mixins: [brickColorMixin],
    methods: {
        setOrderQuantity(item) {
            var partList = this.loadPartList();

            var foundPart = partList.positions.find((pos) => {
                return pos.itemNumber == item.itemNumber;
            });

            if (foundPart) {
                foundPart.qty.min = item.order;
                foundPart.qty.order = item.order;

                if (item.order == 0) {
                    partList.positions = partList.positions.filter(
                        (pos) => pos.itemNumber != item.itemNumber
                    );
                }
                this.$store.commit('partList/setPartList', partList);
                return;
            }
        },
        addToPartList(item) {
            var partList = this.loadPartList();

            var foundPart = partList.positions.find(
                (pos) => pos.itemNumber == item.itemNumber
            );

            if (foundPart) {
                foundPart.qty.min = foundPart.qty.min + 1;
                foundPart.qty.order = foundPart.qty.min;
                this.$store.commit('partList/setPartList', partList);
                return;
            }

            /*if (this.$store.state.partList.totalPositions >= 2000) {
                this.$bvToast.toast(
                    this.labelErrorImportBrickLinkTextToManyPositions,
                    {
                        title: this.labelImportBrickLinkTitle,
                        autoHideDelay: 5000,
                        variant: 'danger',
                    }
                );
                return;
            }*/

            var part = {};
            part.source = 'lego';
            part.designId = item.designId;
            part.itemNumber = item.itemNumber;
            part.color = this.findLegoColor(item.colorFamily, this.COLOR);
            part.searchids = [item.designId];
            part.qty = {
                min: 1,
                have: 0,
                balance: 1,
                order: 1,
            };
            if (item.itemQuantity) {
                part.qty.min = item.itemQuantity;
            }
            if (item.itemQuantity) {
                part.qty.balance = item.itemQuantity;
            }
            part.image = {
                source: 'lego',
                rsc: item.imageUrl,
            };
            part.bricksAndPieces = null;
            part.pickABrick = null;
            part.brickLink = null;

            this.$store.commit('partList/addToPartList', {
                id: this.selectedPartListId,
                part: part,
            });
        },
        loadPartList() {
            if (this.selectedPartListId) {
                return this.$store.getters['partList/getPartListsById'](
                    this.selectedPartListId
                );
            }

            var newPartList = {
                id: this.generateUUID(),
                name: this.labelSinglePartList,
                cart: true,
                date: new Date(0, 0, 0, 0, 0, 0, 0),
                source: 'singleParts',
                positions: [],
            };

            this.$store.commit('partList/setPartList', newPartList);

            bus.$emit('newSinglePartList', true);

            return newPartList;
        },
        generateUUID() {
            // Public Domain/MIT
            var d = new Date().getTime();
            if (
                typeof performance !== 'undefined' &&
                typeof performance.now === 'function'
            ) {
                d += performance.now(); //use high-precision timer if available
            }
            var newGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                /[xy]/g,
                function(c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
                }
            );

            return newGuid;
        },
        async loadBricks(resetPage) {
            this.$scrollTo('.bricksContainer', 100, {
                container: '.bricksContainer',
            });
            this.listUpdate = true;
            if (resetPage) {
                this.currentPage = 1;
            }

            this.currentFilter = {
                page: this.currentPage,
                limit: this.perPage,
                categoryId: this.categoryId,
                colorId: this.selectedColor,
                keyword: this.keyword,
                sortField: this.selectedSort,
                sortDirection: this.sortDirection,
                showAll: !this.showOnlyAvailable,
                showFavorites: this.showFavorites,
                showHaveIts: this.showHaveIts,
                showNotifications: this.showNotifications,
                showPartListId: this.showPartListId,
                excludedCategories: this.excludedCategories,
                selectCategoriesToBeHidden: this.selectCategoriesToBeHidden,
            };

            this.$store.commit('singleParts/setFilter', this.currentFilter);

            let excludedCategories = null;
            if (this.selectCategoriesToBeHidden)
                excludedCategories = this.excludedCategories;
    
            this.search = await apiBrickTwo.getBricksAsync(
                this.currentPage,
                this.perPage,
                this.$store.state.country,
                this.categoryId,
                this.selectedColor,
                this.keyword,
                this.selectedSort,
                this.sortDirection,
                !this.showOnlyAvailable,
                this.selectedItemNumbers,
                this.selectedDesignIds,
                excludedCategories
            );

            if (!this.search) {
                this.totalRows = 0;
                this.currentPage = 1;
                this.listUpdate = false;
                this.$store.commit('singleParts/setCategoriesFiltered', null);
                bus.$emit('CategoriesFiltered', null);
                return;
            }

            this.search.bricks.map((brick) => {
                brick.key = this.componentKey++;
            });

            this.$store.commit(
                'singleParts/setCategoriesFiltered',
                this.search.categories
            );
            bus.$emit('CategoriesFiltered', {
                categories: this.search.categories,
                selected: this.categoryId,
            });

            this.colorList = this.search.colors;
            this.totalRows = this.search.page.total;

            this.selectPart();

            this.loadPrices();
            this.listUpdate = false;
        },
        selectPart() {
            var selectedPartList = this.loadPartList();
            if (selectedPartList) {
                if (!this.search || !this.search.bricks) return;
                this.search.bricks.map((brick) => {
                    var foundPos = selectedPartList.positions.find(
                        (pos) => pos.itemNumber == brick.itemNumber
                    );
                    if (foundPos) {
                        brick.order = foundPos.qty.min;
                    } else {
                        brick.order = 0;
                    }
                });
            }

            this.componentKey++;
        },
        async loadPrices() {
            var designIds = [];
            let currentFilter = JSON.stringify(this.currentFilter);

            this.search.bricks.forEach((brick) => {
                if (
                    !designIds.find((d) => d == brick.designId) &&
                    brick.update
                ) {
                    designIds.push(brick.designId);
                }
            });

            for (var i = 0; i < designIds.length; i++) {
                if (currentFilter != JSON.stringify(this.currentFilter)) return;
                var designId = designIds[i];

                await this.sleep(300); //200ms timout to prevent to be blocked on the website

                var response = await browser.runtime.sendMessage({
                    service: 'bricksAndPieces',
                    action: 'findBrick',
                    designId: designId,
                });

                if (!response) {
                    var found = this.search.bricks.filter(
                        (b) => b.designId == designId
                    );

                    found.map((brick) => {
                        brick.update = false;
                    });
                } else {
                    if (!response.status) {
                        response.bricks.map((brick) => {
                            var found = this.search.bricks.find(
                                (b) =>
                                    b.itemNumber == brick.itemNumber ||
                                    b.alternativeItemNumbers.includes(
                                        `|${brick.itemNumber}|`
                                    )
                            );

                            if (found) {
                                //found.itemNumber = brick.itemNumber;
                                found.color = brick.color;
                                found.colorFamily = brick.colorFamily;
                                found.description = brick.description;
                                found.designId = brick.designId;
                                found.imageUrl = brick.imageUrl;
                                if (brick.isAvailable) {
                                    found.isAvailable = 1;
                                } else {
                                    found.isAvailable = 0;
                                }
                                if (brick.isSoldOut) {
                                    found.isSoldOut = 1;
                                } else {
                                    found.isSoldOut = 0;
                                }
                                found.priceAmount = brick.price.amount.toFixed(
                                    2
                                );
                                found.priceCurrency = brick.price.currency;
                                found.maxAmount = brick.maxAmount;
                                found.update = false;
                                if (
                                    found.maxAmount > 0 &&
                                    found.isAvailable &&
                                    !found.isSoldOut
                                ) {
                                    found.lastSeen = new Date(
                                        new Date(Date.now()).toUTCString()
                                    ).toISOString();
                                }
                                found.lastUpdateCountry = new Date(
                                    new Date(Date.now()).toUTCString()
                                ).toISOString();
                            }
                        });
                    }

                    var found = this.search.bricks.filter(
                        (b) => b.designId == designId
                    );

                    if (response.status) {
                        found.map((brick) => {
                            brick.maxAmount = 0;
                            brick.isAvailable = 0;
                        });
                    }

                    found.map((brick) => {
                        brick.update = false;
                    });

                    if (!response.status) {
                        apiBrickTwo.sendPrices(
                            apiBrickTwo.prepareSendPrice(
                                response.bricks,
                                this.$store.state.country
                            )
                        );
                    }
                }
            }
        },
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        onSelectSortByChange(value) {
            this.$store.commit('addLog', {
                action: 'onSelectSortByChange',
            });
            this.selectedSort = value;
            this.loadBricks(true);
        },
        onSelectSortDirectionChange() {
            this.$store.commit('addLog', {
                action: 'onSelectSortDirectionChange',
            });
            if (this.sortDirection == 'ASC') {
                this.sortDirection = 'DESC';
            } else {
                this.sortDirection = 'ASC';
            }
            this.loadBricks(false);
        },
        onColorChange(value) {
            this.$store.commit('addLog', {
                action: 'onColorChange',
            });
            this.selectedColor = value;
            this.loadBricks(true);
        },
        setKeyword(value) {
            this.$store.commit('addLog', {
                action: 'setKeyword',
            });
            this.selectedColor = 'all';
            this.keyword = value;
            this.onKeywordChange();
        },
        setColor(value) {
            this.$store.commit('addLog', {
                action: 'setColor',
            });
            this.keyword = '';
            this.selectedColor = value;
            this.loadBricks(true);
        },
        onChangeCurrentPage(event) {
            this.$store.commit('addLog', {
                action: 'onChangeCurrentPage',
            });
            this.currentPage = event;
            this.loadBricks(false);
        },
        onChangePerPage(event) {
            this.$store.commit('addLog', {
                action: 'onChangePerPage',
            });
            this.perPage = event;
            this.loadBricks(true);
        },
        onKeywordChange() {
            this.$store.commit('addLog', {
                action: 'onKeywordChange',
            });
            this.loadBricks(true);
        },
        loadFilter() {
            let filter = this.$store.state.singleParts.filter;

            this.currentPage = filter.page;
            this.perPage = filter.limit;
            this.categoryId = filter.categoryId;
            this.selectedColor = filter.colorId;
            this.keyword = filter.keyword;
            this.selectedSort = filter.sortField;
            this.sortDirection = filter.sortDirection;
            this.showOnlyAvailable = !filter.showAll;
            this.tempShowOnlyAvailable = this.showOnlyAvailable;
            this.showFavorites = filter.showFavorites;
            this.showHaveIts = filter.showHaveIts;
            this.showNotifications = filter.showNotifications;
            this.showPartListId = filter.showPartListId;
            this.excludedCategories = filter.excludedCategories;
            this.tempExcludedCategories = this.excludedCategories;
            this.selectCategoriesToBeHidden = filter.selectCategoriesToBeHidden;
            this.tempSelectCategoriesToBeHidden = this.selectCategoriesToBeHidden;
            this.totalRows = this.perPage * this.currentPage;
            this.selectItemNumbers();
        },
        selectItemNumbers() {
            this.selectedItemNumbers = [];
            this.selectedDesignIds = [];

            if (this.showPartListId) {
                let partList = this.$store.getters['partList/getPartListsById'](
                    this.showPartListId
                );
                if (partList)
                    partList.positions.map((pos) =>
                        this.selectedItemNumbers.push(pos.itemNumber)
                    );
            } else {
                if (this.showFavorites)
                    this.selectedItemNumbers = this.$store.state.singleParts.favorites;
                if (this.showHaveIts)
                    this.selectedItemNumbers = this.$store.state.singleParts.haveIts;
                if (this.showNotifications){
                    this.selectedItemNumbers = this.$store.state.singleParts.notificationItemNumbers;
                    this.selectedDesignIds = this.$store.state.singleParts.notificationDesignIds;
                }
            }
        },

        async loadCategories() {
            this.categories = await apiBrickTwo.getCategoriesAsync(
                this.$store.state.country
            );

            this.$store.commit('singleParts/setCategories', this.categories);

            this.categorieOptions = [];
            this.categories.map((cat) => {
                this.categorieOptions.push({
                    text: cat.name,
                    value: cat.id,
                });
            });
        },
        okSettings() {
            this.$store.commit('addLog', {
                action: 'okSettings',
            });
            this.showOnlyAvailable = this.tempShowOnlyAvailable;
            this.selectCategoriesToBeHidden = this.tempSelectCategoriesToBeHidden;
            this.excludedCategories = this.tempExcludedCategories;
            this.loadBricks(true);
        },
        cancleSettings() {
            this.tempShowOnlyAvailable = this.showOnlyAvailable;
            this.tempSelectCategoriesToBeHidden = this.selectCategoriesToBeHidden;
            this.tempExcludedCategories = this.excludedCategories;
        },
    },
    beforeMount() {
        this.loadCategories();
        this.loadFilter();
    },
    mounted() {
        this.$store.commit('addLog', {
            action: 'mounted',
        });
        this.loadBricks();
    },
    created() {
        bus.$on('categorySelected', (categoryId) => {
            this.$store.commit('addLog', {
                action: 'categorySelected',
            });
            this.categoryId = categoryId;

            this.loadBricks(true);
        });
        bus.$on('selectedPartList', (partListId) => {
            this.$store.commit('addLog', {
                action: 'selectedPartList',
            });
            this.selectedPartListId = partListId;

            this.selectPart();
        });
        bus.$on('showPartList', (partListId, showFavorites, showHaveIts, showNotifications) => {
            this.$store.commit('addLog', {
                action: 'showPartList',
            });
            this.showPartListId = partListId;
            this.showFavorites = showFavorites;
            this.showHaveIts = showHaveIts;
            this.showNotifications = showNotifications

            this.selectItemNumbers();
            this.loadBricks(true);
        });
    },
    beforeDestroy() {
        bus.$off();
    },
    computed: {
        labelFindPartsByKeyword() {
            return browser.i18n.getMessage('import_sp_findPartsByKeyword');
        },
        labelDescription() {
            return browser.i18n.getMessage('import_sp_description');
        },
        labelElement() {
            return browser.i18n.getMessage('import_sp_element');
        },
        labelDesignNumber() {
            return browser.i18n.getMessage('import_sp_designNumber');
        },
        labelPrice() {
            return browser.i18n.getMessage('import_sp_price');
        },
        labelMaxAmount() {
            return browser.i18n.getMessage('import_sp_maxAmount');
        },
        labelFirstAvailability() {
            return browser.i18n.getMessage('import_sp_firstAvailability');
        },
        labelSinglePartList() {
            return browser.i18n.getMessage('import_sp_singlePartList');
        },
        labelErrorImportBrickLinkTextToManyPositions() {
            return browser.i18n.getMessage(
                'import_errorImportBrickLinkTextToManyPositions'
            );
        },
        labelSettingsHeader() {
            return browser.i18n.getMessage('import_sp_settingsHeader');
        },
        labelShowOnlyAvailable() {
            return browser.i18n.getMessage('import_sp_showOnlyAvailable');
        },
        labelSelectCategoriesToBeHidden() {
            return browser.i18n.getMessage(
                'import_sp_selectCategoriesToBeHidden'
            );
        },
    },
};
</script>
