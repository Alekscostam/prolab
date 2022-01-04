import React from "react";
import {FixedSizeList as List} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

const CardListContainer = (props) => {
    return <div className={''}  {...props} />;
};

export default function CardInfiniteLoaderWrapper({
                                                      // Are there more items to load?
                                                      // (This information comes from the most recent API request.)
                                                      hasNextPage,

                                                      // Are we currently loading a page of items?
                                                      // (This may be an in-flight flag in your Redux store for example.)
                                                      isNextPageLoading,

                                                      // Array of items loaded so far.
                                                      items,

                                                      // Callback function responsible for loading the next page of items.
                                                      loadNextPage,
                                                      item,
                                                      columnCount,
                                                      cardHeight
                                                  }) {
    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => {
    } : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index) => {
        return !hasNextPage || index < (Math.floor(items.length / columnCount))
    };

    const padding = 10;

    const itemCountFinal = Math.ceil(itemCount / columnCount) < 1 ? 1 : Math.ceil(itemCount / columnCount)
    return (
        <React.Fragment>
            {/*itemCount:{itemCount}*/}
            {/*itemCountFinal:{itemCountFinal}*/}
            {/*columnCount:{columnCount}*/}
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMoreItems}
                threshold={0}
                minimumBatchSize={1}>
                {({onItemsRendered, ref}) => (
                    <List
                        className="infinite-loader-card"
                        height={800}
                        width={1200}
                        itemCount={itemCountFinal}
                        itemSize={cardHeight + padding}
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        innerElementType={CardListContainer}>
                        {item}
                    </List>
                )}
            </InfiniteLoader>
        </React.Fragment>
    );
}
