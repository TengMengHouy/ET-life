import React, { useState } from 'react';
import { formElementsData } from '../data/form-elements';
import { FormElementItem } from './FormElementItem';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search } from 'lucide-react';

export function ElementsSidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredElements = formElementsData.filter((element) =>
    element.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputFields = filteredElements.filter((el) => el.category === 'input');
  const choiceFields = filteredElements.filter((el) => el.category === 'choice');
  const contentFields = filteredElements.filter((el) => el.category === 'content');

  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <h2 className="mb-3">Form Elements</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-white px-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="choice">Choice</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="p-4 space-y-2 mt-0">
            {filteredElements.map((element, index) => (
              <FormElementItem key={`${element.type}-${index}`} element={element} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="input" className="p-4 space-y-2 mt-0">
            {inputFields.map((element, index) => (
              <FormElementItem key={`${element.type}-${index}`} element={element} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="choice" className="p-4 space-y-2 mt-0">
            {choiceFields.map((element, index) => (
              <FormElementItem key={`${element.type}-${index}`} element={element} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="content" className="p-4 space-y-2 mt-0">
            {contentFields.map((element, index) => (
              <FormElementItem key={`${element.type}-${index}`} element={element} index={index} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
